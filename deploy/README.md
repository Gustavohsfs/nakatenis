# Deploy do NakaTenis em VPS Node

Passo a passo para publicar em uma VPS (Hostinger, Contabo, DigitalOcean — tanto faz), com Node + PM2 + Nginx + Certbot.

> **Por que VPS e não hospedagem compartilhada:** sem Node no servidor não há Route Handlers, Auth.js, Prisma, upload de imagem nem painel admin. Hospedagem compartilhada de arquivos estáticos **não suporta este projeto**.

---

## 1. Preparar o servidor

```bash
# Node 20+ LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

sudo npm install -g pm2
sudo apt-get install -y certbot python3-certbot-nginx

sudo mkdir -p /var/log/pm2 /var/www
```

## 2. Clonar o projeto

Crie uma **deploy key** no GitHub (Settings → Deploy keys, somente leitura) e adicione a chave pública da VPS.

```bash
cd /var/www
git clone git@github.com:<usuario>/nakatenis.git
cd nakatenis
```

## 3. Variáveis de ambiente

```bash
cp .env.example .env.production
nano .env.production
chmod 600 .env.production
ln -s .env.production .env      # o Next e o Prisma leem .env
```

Preencha **todas** as chaves. Atenção especial:

| Chave | Valor |
|---|---|
| `DATA_SOURCE` | `prisma` |
| `DATABASE_URL` | conexão **pooled** do Neon (host com `-pooler`) |
| `DIRECT_URL` | conexão **direta** (sem `-pooler`) — usada pelas migrations |
| `AUTH_SECRET` e `NEXTAUTH_SECRET` | mesmo valor: `openssl rand -base64 32` |
| `AUTH_URL` e `NEXTAUTH_URL` | `https://nakatenis.com.br` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_SITE_URL` | `https://nakatenis.com.br` |
| `STORAGE_DRIVER` | `local` ou `cloudinary` |

> `NEXT_PUBLIC_*` é **embutido no build**. Mudou o domínio? Rebuild — reiniciar o PM2 não basta.

## 4. Banco e build

```bash
npm ci
npx prisma generate
npx prisma migrate deploy        # NUNCA `migrate dev` em produção
npm run db:seed                  # opcional: popula o catálogo inicial
npm run build
```

Crie o primeiro administrador (nunca há admin no seed):

```bash
npm run create-admin -- --email=admin@nakatenis.com.br --name="Flávio Nakamura"
# a senha é pedida no prompt, sem eco
```

## 5. Subir com PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup        # execute o comando que ele imprimir
pm2 logs nakatenis
```

## 6. Nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/nakatenis
sudo ln -s /etc/nginx/sites-available/nakatenis /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 7. HTTPS

```bash
sudo certbot --nginx -d nakatenis.com.br -d www.nakatenis.com.br
sudo systemctl status certbot.timer     # renovação automática
```

## 8. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
# a porta 3000 fica fechada para fora — só o Nginx fala com ela
```

## 9. DNS

No painel da Hostinger, aponte para o IP da VPS:

```
A     @      <IP-DA-VPS>
A     www    <IP-DA-VPS>
```

## 10. Uploads locais

Com `STORAGE_DRIVER=local`, as imagens vão para `public/uploads`. Esse diretório **não é versionado** e seria perdido em um `git clean`. Monte-o fora do repositório:

```bash
sudo mkdir -p /var/data/nakatenis/uploads
sudo chown -R $USER:$USER /var/data/nakatenis/uploads
rm -rf /var/www/nakatenis/public/uploads
ln -s /var/data/nakatenis/uploads /var/www/nakatenis/public/uploads
```

Se o volume de imagens crescer, troque para `STORAGE_DRIVER=cloudinary` — é só mudar a env, o adapter já existe.

---

## Deploys seguintes

```bash
cd /var/www/nakatenis
git pull
npm run deploy     # npm ci + generate + migrate deploy + build + pm2 reload
```

## Verificação pós-deploy

1. `https://nakatenis.com.br` responde 200; o header não pisca ao hidratar.
2. `/sitemap.xml` traz o domínio final (não `localhost`).
3. Na PDP, "Comprar agora" abre o `wa.me` com a mensagem formatada e o link absoluto do produto.
4. `/admin` responde **404** para usuário comum e abre para o admin.
5. Upload de imagem pelo painel grava e aparece na vitrine.
6. `pm2 logs nakatenis` sem erros recorrentes.

## Rollback

```bash
git log --oneline -5
git checkout <commit-anterior>
npm ci && npm run build && pm2 reload ecosystem.config.cjs --update-env
```

Migrations **não** são revertidas automaticamente. Se a migration for destrutiva, faça backup do banco antes (`pg_dump`) — no Neon, prefira criar um branch do banco antes do deploy.
