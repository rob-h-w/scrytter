# scrytter

Scry your Twitter feed.

---
## Getting Started

1. Clone the repository.
1. Install docker & docker-compose.
1. Create a file called `.env` at the root of the cloned project.
   1. Populate Twitter client credentials:
      ``` bash
      TWITTER_KEY=your key
      TWITTER_SECRET=your secret
      ```
    1. Populate Arango DB root password:
       ``` bash
       ARANGO_ROOT_PASSWORD=a password
       ```
1. Run:
   ``` bash
   $ docker-compose up -d --build
   ```
   This starts the backing database and the web application.
1. Go to `localhost:8925`.

---
## Debugging
1. Run:
   ``` bash
   $ docker-compose -f docker-compose.yml -f docker-compose.debug.yml up -d --build app
   ```
   This starts the backing database & the web application in debug mode.
   The web app won't run until you attach a debugger.
1. Attach a debugger on port `8926`.
