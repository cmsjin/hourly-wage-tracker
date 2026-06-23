if (process.env.NODE_ENV === 'development') {
  require('@tarojs/mini-runner/dist/setup')
}
require('./src/app.tsx')
