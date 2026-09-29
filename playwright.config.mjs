import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',use:{baseURL:'http://127.0.0.1:8080',channel:process.env.CI?undefined:'chrome',launchOptions:{args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},webServer:{command:'node server.js',url:'http://127.0.0.1:8080',reuseExistingServer:false}});
