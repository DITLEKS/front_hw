# Анализ бандла

## Как запустить анализ

```bash
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

## Результаты сборки

| Чанк | Размер | Содержимое |
|---|---|---|
| `785.chunk.js` | 755 KB | react-markdown, react-syntax-highlighter, Prism.js (vendor) |
| `main.js` | 190 KB | Основной код приложения |
| `171.chunk.js` | 7.4 KB | ChatWindow (lazy) |
| `698.chunk.js` | 2.8 KB | SettingsPanel (lazy) |
| `236.chunk.js` | 2.6 KB | Sidebar (lazy) |

## Выводы

- `react-markdown` и `react-syntax-highlighter` / Prism.js находятся в отдельном vendor-чанке
- Основные UI-компоненты вынесены в lazy-чанки и не попадают в `main.js`
- Код-сплиттинг через React.lazy работает корректно
