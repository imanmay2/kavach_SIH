module.exports = {

  apps: [

    {

      name: 'agent',

      script: 'uvicorn',

      args: 'main:app --host 0.0.0.0 --port 8000', // --reload is removed for production

      interpreter: '/home/laditya_kavach_com/governance/governance-agents/venv/bin/python', // <-- IMPORTANT: Change this path

    },

  ],

};
