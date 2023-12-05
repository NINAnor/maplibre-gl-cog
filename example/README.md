# COG Example
To read COG you need a server that accepts `Range Requests`, this example uses `NGINX` and `docker` to provide such a mechanism.

In project root run

```
npm install
npm run buid
cp dist/index.js example/index.js
```
**TODO**: use `unpkg` to access latest release instead of running the previous commands

Then enter this directory and run
```bash
docker compose up -d
```
