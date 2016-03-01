Polycom Config Generator - Node.js
==================================

Live-generate configurations for your Polycom handsets via a MySQL database.

To deploy, **retrieve a copy of sip.ld from Polycom's website** (too large to include in the repo)

Now, install schema.sql into your database server, then use PM2 (```npm install -g pm2```) to start ```ecosystem.json``` after editing its database and server fields.

Now, add your user's phones into the database and have them pull new data.

Notes
=====

I've used data from Polycom's website in their example configuration files. These are provided openly on their website and seem to have no license attached. If this is determined to be a problem, please contact me.
