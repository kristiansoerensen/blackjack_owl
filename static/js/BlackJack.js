import LoadXML from "./utils/LoadXML.js";
const template = await LoadXML('../xml/BlackJack.xml', import.meta.url);

import {GameBoard} from "./GameBoard.js";

const { Component, mount, unmount } = owl;
const { xml } = owl.tags;
const { whenReady } = owl.utils;
const { useRef, useState } = owl.hooks;

const BLACKJACK_TEMPLATE = xml `${template}`;

class BlackJack extends Component {
    static template = BLACKJACK_TEMPLATE;
    static components = { GameBoard };
    game = useState({active: false, numOfPlayers: []});

    // This function gets executed when the component is mounted to the DOM
    mounted() {
        this.game.numOfPlayers = this.GeneratePlayerInputs(2);
    }

    // This triggers the game to start
    StartGame() {
        this.game.active = true;
        mount(GameBoard, { target: document.getElementById("game-container"), props: this.GetPlayerNames() });
    }

    GetPlayerNames() {
        let playernames = [];
        for (let index = 0; index < this.game.numOfPlayers.length; index++) {
            if (this.game.numOfPlayers[index].playerName.length === 0) {
                this.game.numOfPlayers[index].playerName = "Player " + (index + 1)
            }
            playernames.push(this.game.numOfPlayers[index].playerName)
        }
        return playernames;
    }

    // This function get triggered when the number input changes in the xml / html.
    NumberOfPlayerInputs(ev) {
        console.log("teste");
        this.game.numOfPlayers = this.GeneratePlayerInputs(parseInt(ev.target.value));
    }

    // This function creates the array of inputs.
    GeneratePlayerInputs(numOfPlayers) {
        let playerInputArray = [];
        for (let id = 1; id < numOfPlayers +1; id++) {
            playerInputArray.push(
                {
                    id: "playerid" + id,
                    name: "playername" + id,
                    label: "Player: " + id,
                    playerName: "",
                },
            );
        }
        return playerInputArray;
    }

    UpdatePlayerNameOnChange(ev) {
        console.log(ev);
        let index = this.game.numOfPlayers.findIndex(play => play.id == ev.target.id);
        this.game.numOfPlayers[index].playerName = ev.target.value;
    }
}

// Setup code
function setup() {
    owl.config.mode = "dev";
    mount(BlackJack, { target: document.getElementById("blackjack-container") });
}

whenReady(setup);