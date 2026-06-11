# 自动化部署说明

PC 端是静态站点，部署目标是把 `apps/web/` 同步到服务器 `/home/jewelry-store-assistant`，并由 nginx 对外提供访问。

## 1. 首次安装 SSH 公钥

密码只在这一步输入一次，不写入项目文件。

```bash
cat /Users/turbozhang/Projects/Turbo/jewelry-store-assistant/.deploy/jewelry_store_deploy.pub | ssh -p 22 root@47.99.128.154 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
```

## 2. 初始化服务器

这一步默认只创建部署目录，不修改 nginx 配置，避免影响服务器上已经存在的接口服务。

```bash
cd /Users/turbozhang/Projects/Turbo/jewelry-store-assistant
bash scripts/setup-server.sh
```

只有明确希望这个脚本单独管理一个 nginx 静态站点时，才使用：

```bash
WRITE_NGINX_CONF=1 bash scripts/setup-server.sh
```

## 3. 发布 PC 端

每次修改 `apps/web` 后执行：

```bash
cd /Users/turbozhang/Projects/Turbo/jewelry-store-assistant
bash scripts/deploy-web.sh
```

普通静态文件发布只同步文件，不重启 nginx。只有修改 nginx 配置后，才需要重新执行 `bash scripts/setup-server.sh`，或者临时执行：

```bash
RELOAD_NGINX=1 bash scripts/deploy-web.sh
```

当前服务器 nginx 如果安装在 `/usr/local/nginx/sbin/nginx`，脚本会默认使用这个路径。若后续路径不同，可以这样指定：

```bash
NGINX_BIN=/usr/local/nginx/sbin/nginx RELOAD_NGINX=1 bash scripts/deploy-web.sh
```

发布完成后访问：

```text
http://47.99.128.154/
```

## 常用覆盖参数

默认参数已经按当前服务器配置好。后续换服务器或目录时，可以临时覆盖：

```bash
SERVER_HOST=example.com DEPLOY_DIR=/home/jewelry-store-assistant bash scripts/deploy-web.sh
```

## 注意事项

- 如果浏览器打不开，先检查云服务器安全组是否放行 HTTP 端口 `80`。
- 如果服务器不是 root 用户，需要确保该用户有部署目录和 nginx 配置权限。
- 当前 PC 端数据保存在浏览器本地，部署不会迁移任何门店本地录入数据。
- 微信内置浏览器缓存比较明显，当前 nginx 配置会对 `index.html`、`css`、`js` 返回 `no-store`，优先保证每次打开看到最新版本。

## 恢复 nginx

如果之前执行过旧版 `setup-server.sh` 导致 nginx 配置异常，执行：

```bash
bash scripts/restore-nginx-after-setup.sh
```

如果服务器没有 `systemctl`，恢复脚本会默认使用 `/usr/local/nginx/sbin/nginx -t` 和 `/usr/local/nginx/sbin/nginx -s reload`。
