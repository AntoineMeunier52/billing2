# Déploiement en Production

## Prérequis sur le serveur

1. Node.js v18+ installé
2. MySQL/MariaDB installé et accessible
3. PM2 installé globalement: `npm install -g pm2`

## Étapes de déploiement

### 1. Transférer les fichiers sur le serveur
```bash
# Copier tout le projet SAUF node_modules, .nuxt, .output, et .env
rsync -av --exclude 'node_modules' --exclude '.nuxt' --exclude '.output' --exclude '.env' ./ user@server:/path/to/app/
```

### 2. Sur le serveur - Configuration

```bash
cd /path/to/app

# Créer le fichier .env de production (IMPORTANT!)
nano .env
```

**Contenu minimal du .env de production:**
```env
# Database
DB_URI=mysql://user:password@host:3307/billing

# JWT (CHANGER OBLIGATOIREMENT!)
JWT_SECRET=VOTRE_SECRET_SUPER_SECURE_MIN_32_CHARS

# Session
NUXT_SESSION_PASSWORD=VOTRE_PASSWORD_SESSION_32_CHARS

# App
APP_URL=https://votre-domaine.com
NODE_ENV=production

# PDF
PATH_TO_PDF=/path/to/pdf/storage
INVOICE_LOGO_PATH=./server/assets/logo.png

# Sewan API
SEWAN_BASE_URL=https://sbcng.sewan.be
SEWAN_LOGIN_URL=https://sbcng.sewan.be/api/login
SEWAN_CDR_URL=https://sbcng.sewan.be/api/cdr/
SEWAN_DDI_URL=https://sbcng.sewan.be/api/dids/
SEWAN_USER=votre_user
SEWAN_PASSWORD=votre_password
DDI_PRICE_DEFAULT=1

# SMTP
SMTP_HOST=votre.smtp.com
SMTP_PORT=587
SMTP_USER=votre_user
SMTP_PASS=votre_password
SMTP_FROM=noreply@votre-domaine.com

# Synology (optionnel)
SYNOLOGY_UPLOAD_ENABLED=false
SYNOLOGY_WEBDAV_URL=https://your-synology.com:5006
SYNOLOGY_WEBDAV_USER=
SYNOLOGY_WEBDAV_PASSWORD=
SYNOLOGY_WEBDAV_PATH=/invoices
```

### 3. Installation des dépendances

```bash
# Installer les dépendances de production
npm ci --production=false

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy
```

### 4. Build de l'application

```bash
npm run build
```

### 5. Démarrer avec PM2

```bash
# Démarrer l'application
pm2 start npm --name "billing" -- start

# Sauvegarder la config PM2
pm2 save

# Auto-démarrage au boot
pm2 startup
# Suivre les instructions affichées

# Vérifier les logs
pm2 logs billing

# Vérifier le status
pm2 status
```

### 6. Configuration Nginx (optionnel mais recommandé)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Commandes PM2 utiles

```bash
# Redémarrer l'app
pm2 restart billing

# Voir les logs
pm2 logs billing

# Voir les logs en temps réel
pm2 logs billing --lines 100

# Arrêter l'app
pm2 stop billing

# Supprimer l'app
pm2 delete billing

# Lister toutes les apps
pm2 list

# Monitoring
pm2 monit
```

## Mise à jour de l'application

```bash
# 1. Transférer les nouveaux fichiers
rsync -av --exclude 'node_modules' --exclude '.env' ./ user@server:/path/to/app/

# 2. Sur le serveur
cd /path/to/app
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart billing
```

## Troubleshooting

### L'authentification ne marche pas
- Vérifier que `JWT_SECRET` est bien défini dans le `.env`
- Vérifier que `NUXT_SESSION_PASSWORD` est défini
- Vider le localStorage du navigateur et réessayer

### Les données ne se chargent pas
- Vérifier que la base de données est accessible: `npx prisma db pull`
- Vérifier les logs PM2: `pm2 logs billing --err`
- Vérifier que les migrations sont appliquées: `npx prisma migrate status`

### Erreur de connexion base de données
- Vérifier `DB_URI` dans `.env`
- Vérifier que MySQL est démarré: `systemctl status mysql`
- Tester la connexion: `mysql -u user -p -h host`

### Port déjà utilisé
Par défaut Nuxt utilise le port 3000. Pour changer:
```bash
# Ajouter dans .env
PORT=3001

# Ou démarrer avec PM2:
pm2 start npm --name "billing" -- start -- --port 3001
```

### Voir les erreurs en détail
```bash
# Logs en temps réel
pm2 logs billing --lines 200

# Redémarrer en mode watch pour debug
pm2 restart billing --watch
```

## Variables d'environnement CRITIQUES

⚠️ **ATTENTION**: Ces variables DOIVENT être différentes de celles de développement!

1. `JWT_SECRET` - Minimum 32 caractères aléatoires
2. `NUXT_SESSION_PASSWORD` - Minimum 32 caractères aléatoires
3. `DB_URI` - Pointant vers la base de données de production
4. `APP_URL` - URL de production (avec HTTPS)
5. `SMTP_*` - Credentials SMTP de production

## Génération de secrets sécurisés

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# NUXT_SESSION_PASSWORD
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Checklist avant mise en production

- [ ] `.env` créé avec toutes les variables
- [ ] `JWT_SECRET` changé (différent du dev)
- [ ] `NUXT_SESSION_PASSWORD` changé
- [ ] Base de données créée et accessible
- [ ] Migrations appliquées (`npx prisma migrate deploy`)
- [ ] Client Prisma généré (`npx prisma generate`)
- [ ] Build réussi (`npm run build`)
- [ ] PM2 configuré et app démarrée
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Test de connexion/authentification
- [ ] HTTPS configuré (Nginx/Caddy)
- [ ] Firewall configuré
- [ ] Sauvegardes DB configurées
