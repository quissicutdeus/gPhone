fx_version 'cerulean'
game 'gta5'

author 'mbiddle'
version '1.0.0'
description 'A modern phone for FiveM'
repository 'https://github.com/mbiddle/gphone'

lua54 'yes'

server_script 'dist/server/**/*.js'
client_script 'dist/client/**/*.js'

ui_page 'dist/web/index.html'

files {
  'dist/web/index.html',
  'dist/web/assets/**/*',
  'dist/web/*.svg',
}

