# Kitten Glow Messenger

Основная информация о проекте находится в документе
[Notion](https://nopicat.notion.site/Kitten-Glow-fa4bb5cf23ea45cc854317e6ff3f9e80).

Впереди еще невероятно много работы. 

### Режим разработки

Переименуйте `.env.example` в `.env` и измените переменные так, как нужно вам.

Для запуска введите в терминал:
```bash 
$ docker compose up
```

Запуск миграции:
```bash 
$ docker compose exec api npx prisma migrate dev
```

В режиме разработки для удобства открыты порты у каждой базы данных, что позволяет 
редактировать данные из приложений, подобных **TablePlus**.

Работает **Swagger UI** на `/docs`.

