const data = {
    local: {
      mongodb: {
        url: 'mongodb://localhost:27017/vs-court-agent',
      },
    },
    qe: {
      url: 'mongodb://qe-admin:DgjYZpxj7UcsgAjQ9Wz@BPNb@10.0.0.50:31017/marketplace_ui_test',
    },
  }
  
  module.exports = (key) => {
    const env = process.env.NODE_ENV || 'local'
    return data[env][key]
  }
  