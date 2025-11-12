Secrets drop zone

Drop secret text files into the `secrets/drop/` directory. Files must be named:

 - SECRET_<NAME>.txt  (e.g., SECRET_GCP_SA.json.txt)
 - TOKEN_<NAME>.txt   (e.g., TOKEN_ZEN)

A processing tool will read files from `secrets/drop/`, validate, and inject variables into a runtime `.env` (not committed).

Security
 - Do NOT commit secrets into git.
 - Ensure `secrets/` is in `.gitignore`.
 - Prefer storing long-lived credentials in a secret manager (GCP Secret Manager, AWS Secrets Manager) and use short-lived keys.
