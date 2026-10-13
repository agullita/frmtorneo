-- Configurar OTP expiry a un valor más seguro (3600 segundos = 1 hora)
UPDATE auth.config 
SET otp_expiry = 3600 
WHERE otp_expiry > 3600;