# Инструкция по размещению проекта в интернете

## Вариант 1: Vercel (Рекомендуется - самый простой)

### Способ A: Через веб-интерфейс (без Git)

1. **Соберите проект локально:**
   ```bash
   npm run build
   ```

2. **Зарегистрируйтесь на Vercel:**
   - Перейдите на https://vercel.com
   - Войдите через GitHub, Google или Email

3. **Загрузите проект:**
   - Нажмите "Add New" → "Project"
   - Выберите "Import" → "Browse" или перетащите папку `dist` (после сборки)
   - Или используйте Vercel CLI (см. ниже)

### Способ B: Через Vercel CLI

1. **Установите Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Войдите в Vercel:**
   ```bash
   vercel login
   ```

3. **Задеплойте проект:**
   ```bash
   cd "/Users/annaolejnik/Downloads/Создание редактируемого road map"
   vercel
   ```

4. **Следуйте инструкциям:**
   - Выберите настройки по умолчанию
   - Vercel автоматически определит Vite и настроит сборку

5. **После деплоя:**
   - Вы получите URL вида: `https://your-project.vercel.app`
   - Этот URL можно будет открывать с любого устройства

### Способ C: Через GitHub (автоматический деплой)

1. **Создайте репозиторий на GitHub:**
   - Зайдите на https://github.com
   - Создайте новый репозиторий
   - Загрузите туда код проекта

2. **Подключите к Vercel:**
   - В Vercel нажмите "Add New" → "Project"
   - Импортируйте ваш GitHub репозиторий
   - Vercel автоматически будет деплоить при каждом обновлении кода

---

## Вариант 2: Netlify

1. **Соберите проект:**
   ```bash
   npm run build
   ```

2. **Зарегистрируйтесь на Netlify:**
   - Перейдите на https://www.netlify.com
   - Войдите через GitHub, Email или Google

3. **Загрузите проект:**
   - Перетащите папку `dist` на страницу Netlify
   - Или используйте Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=dist
     ```

---

## Вариант 3: Cloudflare Pages

1. **Соберите проект:**
   ```bash
   npm run build
   ```

2. **Зарегистрируйтесь:**
   - Перейдите на https://pages.cloudflare.com
   - Войдите через Cloudflare аккаунт

3. **Загрузите проект:**
   - Создайте новый проект
   - Загрузите папку `dist`
   - Или подключите GitHub репозиторий

---

## Вариант 4: GitHub Pages

1. **Установите gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Добавьте скрипт в package.json:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Создайте репозиторий на GitHub и задеплойте:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   npm run deploy
   ```

---

## Важные замечания

⚠️ **Важно:** После деплоя все пользователи будут видеть одну и ту же версию roadmap. 
Изменения, которые пользователи делают через браузер, сохраняются только в их localStorage (локально на их устройстве).

Если нужно, чтобы изменения были общими для всех, потребуется:
- Backend сервер (например, Firebase, Supabase, или собственный API)
- База данных для хранения данных

---

## Быстрый старт (Vercel CLI)

```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Войдите
vercel login

# 3. Задеплойте
cd "/Users/annaolejnik/Downloads/Создание редактируемого road map"
vercel

# 4. Для продакшена
vercel --prod
```

После выполнения команды `vercel --prod` вы получите постоянный URL для вашего проекта!
