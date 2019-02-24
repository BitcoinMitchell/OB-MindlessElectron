/**
 * This class handles all the passed arguments and makes sure everything is set before passing it onto {@link Settings}
 *
 * @class Arguments
 */
module.exports = function() {
  const configPath = require('path').normalize(__dirname + "/../settings/config.json"),
    yargs = require('yargs').usage('Starts the MindlessElectron bot. Change the config.json file to set options or pass them on the command line')
      .describe("config", "Where is the config file located?").default("config", configPath).config("config").global('config')
      .describe('groups', 'The groups we are going to join').demand('groups')
      .describe('verbose', 'Do you want extra information, usually handy for debugging').default('verbose', false)
      .describe('help', 'Shows this overview.')
      .epilog('Copyright - Mitchell')
      .wrap(120);

  if (yargs.argv.secure) yargs.demand('cert');
  if (yargs.argv.help != null) {
    yargs.showHelp();
    process.exit(0);
  }

  return yargs.argv;
};
