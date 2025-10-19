import React, { useState, useEffect } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Bell,
  Clock,
  Database,
  Trash2,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Slack,
  FileSpreadsheet,
  Smartphone
} from 'lucide-react';

interface CourtFeedHit {
  id: string;
  daily_sequence: number;
  keyword: string;
  court_name: string;
  case_title: string;
  decision_date: string;
  content_snippet: string;
  full_url: string;
  usim_header: string;
  created_at: string;
  ttl_expires: string;
}

interface WatchKeyword {
  keyword: string;
  enabled: boolean;
  hit_count: number;
  last_hit: string;
}

interface USIMCourtFeedProcessorProps {
  onNotificationSent?: (hit: CourtFeedHit) => void;
}

export const USIMCourtFeedProcessor: React.FC<USIMCourtFeedProcessorProps> = ({
  onNotificationSent
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [watchKeywords, setWatchKeywords] = useState<WatchKeyword[]>([
    { keyword: 'cyber', enabled: true, hit_count: 0, last_hit: '' },
    { keyword: 'cartel', enabled: true, hit_count: 0, last_hit: '' },
    { keyword: 'terrorism', enabled: true, hit_count: 0, last_hit: '' },
    { keyword: 'new orleans', enabled: true, hit_count: 0, last_hit: '' },
    { keyword: 'corruption', enabled: true, hit_count: 0, last_hit: '' }
  ]);
  const [recentHits, setRecentHits] = useState<CourtFeedHit[]>([]);
  const [googleSheetsStatus, setGoogleSheetsStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [slackStatus, setSlackStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [dailySequence, setDailySequence] = useState(0);
  const [processingStats, setProcessingStats] = useState({
    feeds_processed: 0,
    hits_found: 0,
    notifications_sent: 0,
    last_cleanup: ''
  });

  useEffect(() => {
    initializeEphemeralStorage();
    startCourtFeedStream();
    scheduleCleanup();
  }, []);

  const initializeEphemeralStorage = async () => {
    try {
      // Initialize Google Sheets ephemeral storage
      const sheetsResponse = await fetch('http://localhost:3001/ephemeral/sheets/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheet_name: `CTAS7_Court_Feed_${new Date().toISOString().split('T')[0]}`,
          ttl_hours: 24,
          auto_cleanup: true,
          headers: ['Daily_Seq', 'Keyword', 'Court', 'Case_Title', 'Date', 'USIM_Header', 'URL', 'TTL_Expires']
        })
      });

      if (sheetsResponse.ok) {
        setGoogleSheetsStatus('connected');
      } else {
        setGoogleSheetsStatus('error');
      }

      // Initialize Slack notifications
      const slackResponse = await fetch('http://localhost:3001/notifications/slack/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: '#ctas7-court-feeds',
          webhook_url: process.env.REACT_APP_SLACK_WEBHOOK_URL
        })
      });

      if (slackResponse.ok) {
        setSlackStatus('connected');
      } else {
        setSlackStatus('error');
      }
    } catch (error) {
      console.error('Failed to initialize ephemeral storage:', error);
      setGoogleSheetsStatus('error');
      setSlackStatus('error');
    }
  };

  const startCourtFeedStream = async () => {
    setIsProcessing(true);

    try {
      // Start dual-source court feeds: CourtListener + JudyRecords
      const responses = await Promise.all([
        // CourtListener RSS feeds
        fetch('http://localhost:3001/streams/courtlistener/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feed_urls: [
              'https://www.courtlistener.com/feed/court/all/',
              'https://www.courtlistener.com/feed/search/?type=o&q=recent'
            ],
            keywords: watchKeywords.filter(k => k.enabled).map(k => k.keyword),
            processing_mode: 'ephemeral',
            batch_size: 50,
            interval_seconds: 30,
            source_tag: 'courtlistener'
          })
        }),

        // JudyRecords API monitoring
        fetch('http://localhost:3001/streams/judyrecords/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monitoring_config: {
              keywords: watchKeywords.filter(k => k.enabled).map(k => k.keyword),
              jurisdictions: ['federal', 'state'],
              poll_interval_minutes: 5,
              max_results_per_poll: 100,
              notification_threshold: 'immediate',
              ephemeral_storage: true,
              ttl_hours: 24,
              source_tag: 'judyrecords'
            }
          })
        })
      ]);

      if (responses.every(r => r.ok)) {
        // Set up Server-Sent Events for both sources
        const courtListenerEvents = new EventSource('http://localhost:3001/streams/courtlistener/events');
        const judyRecordsEvents = new EventSource('http://localhost:3001/streams/judyrecords/events');

        courtListenerEvents.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleCourtFeedHit({ ...data, source: 'courtlistener' });
        };

        judyRecordsEvents.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleCourtFeedHit({ ...data, source: 'judyrecords' });
        };

        courtListenerEvents.onerror = () => {
          console.error('CourtListener stream error');
        };

        judyRecordsEvents.onerror = () => {
          console.error('JudyRecords stream error');
        };

        setProcessingStats(prev => ({
          ...prev,
          feeds_processed: prev.feeds_processed + 2
        }));
      }
    } catch (error) {
      console.error('Failed to start court feed streams:', error);
      setIsProcessing(false);
    }
  };

  const handleCourtFeedHit = async (feedData: any) => {
    const today = new Date().toISOString().split('T')[0];
    const sequence = dailySequence + 1;
    setDailySequence(sequence);

    const hit: CourtFeedHit = {
      id: `ctas7-${today}-${sequence.toString().padStart(4, '0')}`,
      daily_sequence: sequence,
      keyword: feedData.matched_keyword,
      court_name: feedData.court_name,
      case_title: feedData.case_title,
      decision_date: feedData.decision_date,
      content_snippet: feedData.content.substring(0, 200) + '...',
      full_url: feedData.url,
      usim_header: generateUSIMHeader(feedData),
      created_at: new Date().toISOString(),
      ttl_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    // Store in Google Sheets ephemeral storage
    await storeInEphemeralStorage(hit);

    // Send notifications
    await sendNotifications(hit);

    // Update local state
    setRecentHits(prev => [hit, ...prev.slice(0, 9)]);
    updateKeywordStats(hit.keyword);

    onNotificationSent?.(hit);
  };

  const generateUSIMHeader = (feedData: any): string => {
    return [
      '% CTAS-7 Universal System Integration Manifest',
      `% System ID: CTAS7:STREAM:COURT:${feedData.court_id}`,
      `% Document Type: COURT_DECISION_FEED_HIT`,
      `% SCH Hash: blake3("court_feed:${new Date().toISOString()}")`,
      `% CUID: ctas7:court:${feedData.court_id}:${Date.now()}`,
      `% Classification: EPHEMERAL_STREAM_DATA`,
      `% Created: ${new Date().toISOString()}`,
      `% TTL: 24h`,
      `% Source: ${feedData.url}`
    ].join('\n');
  };

  const storeInEphemeralStorage = async (hit: CourtFeedHit) => {
    try {
      // Store in Google Sheets
      await fetch('http://localhost:3001/ephemeral/sheets/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row_data: [
            hit.daily_sequence,
            hit.keyword,
            hit.court_name,
            hit.case_title,
            hit.decision_date,
            hit.usim_header.split('\n')[0], // First line only for sheets
            hit.full_url,
            hit.ttl_expires
          ]
        })
      });

      setProcessingStats(prev => ({
        ...prev,
        hits_found: prev.hits_found + 1
      }));
    } catch (error) {
      console.error('Failed to store in ephemeral storage:', error);
    }
  };

  const sendNotifications = async (hit: CourtFeedHit) => {
    try {
      // Slack notification
      await fetch('http://localhost:3001/notifications/slack/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 CTAS7 Court Feed Hit: "${hit.keyword}"`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Court:* ${hit.court_name}\n*Case:* ${hit.case_title}\n*Keyword:* ${hit.keyword}\n*Sequence:* ${hit.daily_sequence}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'View Full Case' },
                  url: hit.full_url
                }
              ]
            }
          ]
        })
      });

      // iOS notification (if configured)
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('CTAS7 Court Feed Hit', {
            body: `${hit.keyword} detected in ${hit.court_name}`,
            icon: '/ctas7-icon.png',
            tag: hit.id,
            data: { url: hit.full_url }
          });
        });
      }

      setProcessingStats(prev => ({
        ...prev,
        notifications_sent: prev.notifications_sent + 1
      }));
    } catch (error) {
      console.error('Failed to send notifications:', error);
    }
  };

  const updateKeywordStats = (keyword: string) => {
    setWatchKeywords(prev => prev.map(k =>
      k.keyword === keyword
        ? { ...k, hit_count: k.hit_count + 1, last_hit: new Date().toISOString() }
        : k
    ));
  };

  const toggleKeyword = (keyword: string) => {
    setWatchKeywords(prev => prev.map(k =>
      k.keyword === keyword
        ? { ...k, enabled: !k.enabled }
        : k
    ));
  };

  const scheduleCleanup = () => {
    // Schedule automatic cleanup every hour
    setInterval(async () => {
      try {
        await fetch('http://localhost:3001/ephemeral/cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cleanup_expired: true,
            max_age_hours: 24
          })
        });

        setProcessingStats(prev => ({
          ...prev,
          last_cleanup: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Cleanup failed:', error);
      }
    }, 60 * 60 * 1000); // Every hour
  };

  const manualCleanup = async () => {
    try {
      await fetch('http://localhost:3001/ephemeral/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cleanup_all: true,
          force: true
        })
      });

      setRecentHits([]);
      setDailySequence(0);
      setProcessingStats(prev => ({
        ...prev,
        hits_found: 0,
        notifications_sent: 0,
        last_cleanup: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Manual cleanup failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'disconnected': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-100">USIM Court Feed Processor</h2>
            <div className="flex items-center space-x-2">
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 text-green-400 animate-spin" />
              ) : (
                <Activity className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-slate-300">
                {isProcessing ? 'Streaming' : 'Idle'}
              </span>
            </div>
          </div>

          <button
            onClick={manualCleanup}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Cleanup</span>
          </button>
        </div>

        <p className="text-slate-400 text-sm">
          Ephemeral stream processing for live federal court feeds with keyword monitoring and automatic cleanup.
        </p>
      </div>

      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-100 font-medium">Google Sheets</h3>
            {getStatusIcon(googleSheetsStatus)}
          </div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-green-400" />
            <span className="text-slate-300 text-sm">Ephemeral Storage</span>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-100 font-medium">Slack Alerts</h3>
            {getStatusIcon(slackStatus)}
          </div>
          <div className="flex items-center space-x-2">
            <Slack className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300 text-sm">Notifications</span>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-100 font-medium">iOS Native</h3>
            <Smartphone className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 text-sm">Push Ready</span>
          </div>
        </div>
      </div>

      {/* Processing Stats */}
      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Processing Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{processingStats.feeds_processed}</div>
            <div className="text-slate-400 text-sm">Feeds Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{processingStats.hits_found}</div>
            <div className="text-slate-400 text-sm">Hits Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{processingStats.notifications_sent}</div>
            <div className="text-slate-400 text-sm">Notifications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{dailySequence}</div>
            <div className="text-slate-400 text-sm">Daily Sequence</div>
          </div>
        </div>
        {processingStats.last_cleanup && (
          <div className="mt-4 text-center text-slate-400 text-sm">
            Last Cleanup: {new Date(processingStats.last_cleanup).toLocaleString()}
          </div>
        )}
      </div>

      {/* Watch Keywords */}
      <div className="bg-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Watch Keywords</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchKeywords.map((keyword) => (
            <div key={keyword.keyword} className="bg-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-100 font-medium capitalize">{keyword.keyword}</span>
                <button
                  onClick={() => toggleKeyword(keyword.keyword)}
                  className={`p-1 rounded ${keyword.enabled ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {keyword.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-slate-300 text-sm">
                <div>Hits: {keyword.hit_count}</div>
                {keyword.last_hit && (
                  <div>Last: {new Date(keyword.last_hit).toLocaleTimeString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Hits */}
      {recentHits.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Recent Court Feed Hits</h3>
          <div className="space-y-3">
            {recentHits.map((hit) => (
              <div key={hit.id} className="bg-slate-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-cyan-400 font-mono text-sm">#{hit.daily_sequence}</span>
                      <span className="bg-orange-600 px-2 py-1 rounded text-xs text-white">
                        {hit.keyword}
                      </span>
                    </div>
                    <h4 className="text-slate-100 font-medium">{hit.case_title}</h4>
                    <p className="text-slate-300 text-sm">{hit.court_name}</p>
                  </div>
                  <div className="text-right text-slate-400 text-xs">
                    <div>{new Date(hit.created_at).toLocaleTimeString()}</div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>TTL: {new Date(hit.ttl_expires).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-3">{hit.content_snippet}</p>
                <div className="flex items-center justify-between">
                  <a
                    href={hit.full_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-sm underline"
                  >
                    View Full Case →
                  </a>
                  <span className="text-slate-500 text-xs font-mono">{hit.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Commands */}
      <div className="bg-slate-800 border border-purple-400/20 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-100">iOS Native Commands</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-slate-300 font-medium text-sm">Watch Commands:</p>
            <div className="space-y-1 text-xs text-slate-400">
              <p>• "Watch cyber cases in federal courts"</p>
              <p>• "Stop watching corruption keyword"</p>
              <p>• "Show me today's court feed hits"</p>
              <p>• "Toggle New Orleans case monitoring"</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-300 font-medium text-sm">Cleanup Commands:</p>
            <div className="space-y-1 text-xs text-slate-400">
              <p>• "Clean up expired court data"</p>
              <p>• "Show ephemeral storage status"</p>
              <p>• "Export today's hits to OneDrive"</p>
              <p>• "Reset daily sequence counter"</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-purple-400/10 rounded border border-purple-400/20">
          <p className="text-purple-300 text-sm">
            <strong>Simple Toggle:</strong> "Hey CTAS, watch cyber cases" or "stop watching terrorism"
            automatically updates your ephemeral storage and iOS notifications.
          </p>
        </div>
      </div>
    </div>
  );
};