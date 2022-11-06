# 反向代理谷歌翻译

> 前提条件: 需要拥有一个自己的域名, 需要熟悉基础的命令行操作

1. 创建 Vercel 账号: [https://vercel.com](https://vercel.com/);
2. 配置 nodejs 环境: [https://nodejs.org/zh-cn/download/](https://nodejs.org/zh-cn/download/);
3. 安装 vercel-cli: `npm i -g vercel` ;
4. 登录 vercel: `vercel login` 参考 [https://vercel.com/docs/cli/login](https://vercel.com/docs/cli/login);
5. 将配置发布到生产环境: `vercel -A translate.google.com.json --prod`
6. 配置自定义域名: `vercel domains add google-translate.[你自己的域名].com`;
7. 为上一步配置自定义的配置 DNS 解析, 在你的域名管理处添加一条 `CNAME google-translate cname-china.vercel-dns.com`;
8. 网页访问测试配置的自定义域名: `google-translate.[你自己的域名].com`;
