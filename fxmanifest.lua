fx_version 'cerulean'
name 'FiveM TypeScript Boilerplate'
author 'Project Error'
game 'gta5'

server_script 'dist/server/**/*.js'
client_script 'dist/client/**/*.js'

ui_page 'dist/web/index.html'

files {
  'dist/web/index.html',
  'dist/web/assets/*.js',
  'dist/web/assets/*.css',
  'dist/web/vite.svg', -- if applicable
}

