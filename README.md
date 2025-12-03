# itam_hackaton


## Start 

Для локального запуска есть два варианта 
- Запуск с ghcr (чтобы не билдить на локальной машине) ((1))
- Запуск с сборкой на локальной машине (2)

### 1
Скопируйте .env.example в папку deploy с названием .env
```bash
cd deploy
docker compose up
```

Соответственно для обновления пакетов: 
```bash
docker compose pull backend
docker compose pull tgbot
```

### 2
Скопируйте .env.example в папку deploy/local с названием .env
```
cd deploy/local
docker compose up
```