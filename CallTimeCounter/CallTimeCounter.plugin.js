/**
    * @name CallTimeCounter
    * @source https://github.com/QWERTxD/BetterDiscordPlugins/blob/main/CallTimeCounter/CallTimeCounter.plugin.js
    * @description Shows how much time you are in a voice chat.
    * @updateUrl https://raw.githubusercontent.com/QWERTxD/BetterDiscordPlugins/main/CallTimeCounter/CallTimeCounter.plugin.js
    * @website https://github.com/QWERTxD/BetterDiscordPlugins/tree/main/CallTimeCounter
    */
    
    const request = require("request");
    const fs = require("fs");
    const path = require("path");
    
    const config = {
        info: {
            name: "CallTimeCounter",
            authors: [
                {
                    name: "QWERT"
                }
            ],
            version: "0.0.1",
            description: "Shows how much time you are in a voice chat.",
        },
        changelog: [
            {
                title: "hello world",
                type: "added",
                items: [
                    "plugin"
                    ]
            }
        ],
        defaultConfig: [  ]
    };
    
    module.exports = !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }
    
        load() {
            BdApi.showConfirmationModal("Library plugin is needed",
                `The library plugin needed for AQWERT'sPluginBuilder is missing. Please click Download Now to install it.`, {
                    confirmText: "Download",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
                            if (error)
                                return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
    
                            fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                        });
                    }
                });
        }
    
        start() { }
    
        stop() { }
    } : (([Plugin, Library]) => {
        const { DiscordModules, WebpackModules, Patcher, PluginUtilities } = Library;
        const { React, Dispatcher } = DiscordModules;
        const PanelSubtext = WebpackModules.find(m => m?.default?.displayName === "PanelSubtext");

        class Timer extends React.Component {
            constructor (props) {
              super(props);
              this.connected = this.connected.bind(this);
              this.state = {
                startTime: 0,
                delta: 0
              };
            }
          
            connected (e) {
              if (e.state && e.state === 'RTC_DISCONNECTED' && !e.hasOwnProperty('streamKey')) {
                this.setState((prev) => (
                  prev.startTime = Date.now()));
              }
            }
          
            componentDidMount () {
              this.setState((prev) => (
               prev.startTime = Date.now()));
               Dispatcher.subscribe('RTC_CONNECTION_STATE', this.connected);
               this.interval = setInterval(() => {
                this.setState((prev) => (prev.delta = Math.round((Date.now() - prev.startTime) / 1000) * 1000));
              }, 1000);
            }
          
            componentWillUnmount () {
              Dispatcher.unsubscribe('RTC_CONNECTION_STATE', this.connected);
              clearInterval(this.interval);
            }
          
            render () {
              return React.createElement("div", { className: "voiceTimer" }, `Time elapsed: ${new Date(this.state.delta).toISOString().substr(11, 8)}`);
            }
        };

        class plugin extends Plugin {
            constructor() {
                super();
                this.getSettingsPanel = () => {
                    console.log(this.buildSettingsPanel().getElement());
                    return this.buildSettingsPanel().getElement();
                };
            }
            
    
            onStart() {
              this.patch();

              PluginUtilities.addStyle("voicetimer", `
              .voiceTimer {
                text-decoration: none !important;
                margin-top: 8px;
              }
              `)
            }
    
            onStop() { 
              Patcher.unpatchAll();
              PluginUtilities.removeStyle("voicetimer");
            }

            patch() {
                Patcher.after(PanelSubtext, "default", (_, [props], ret) => {
                    if (!props.className || !props.className.includes('channel')) return;
                    ret.props.children = [
                        props.children,
                        React.createElement(Timer, {className: "voiceTimer"})
                    ]
                })
            }
    
        }
    
        return plugin;
    })(global.ZeresPluginLibrary.buildPlugin(config));