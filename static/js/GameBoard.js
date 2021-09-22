import LoadXML from "./utils/LoadXML.js";
import {cards} from "./lib/cards.js";
const template = await LoadXML('../xml/GameBoard.xml', import.meta.url);
import {Player} from "./Player.js"

const { Component } = owl;
const { xml } = owl.tags;
const { useState } = owl.hooks;

const GAMEBOARD_TEMPLATE = xml `${template}`;

export class GameBoard extends Component {
    static template = GAMEBOARD_TEMPLATE;
    static components = {Player};
    players = useState([]);
    deck = [];
    maksPoints = 21;
    firstRound = true;

    CreatePlayers() {
        for (let i = 1; i <= this.props.length; i++) {
            let player = {
                id: i,
                name: this.props[i-1],
                points: 0,
                activePlayer: i == 1 ? true : false,
                hand: [],
                status: "",
            };
            this.players.push(player);
        }
    }

    mounted() {
        this.CreatePlayers();
        this.StartGame();
    }

    StartGame() {
        this.ShuffleDeck()
        for (const key in this.players) {
            this.DrawCard(key);
            this.DrawCard(key);
        }
        this.firstRound = false;
    }

    ShuffleDeck() {
        this.deck = cards;
        for (let _ = 0; _ < 100; _++) {
            for (let i = this.deck.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * i);
                let temp = this.deck[i];
                this.deck[i] = this.deck[j];
                this.deck[j] = temp;
            }
        }
        this.deck = useState(this.deck);
    }

    DrawCard(playerIndex) {
        let card = this.deck.shift();
        this.players[playerIndex].hand.push(card);
        if (card.value === 1 && !this.firstRound){
            this.players[playerIndex].points += confirm("You got an ace, do you want 11 point for it?") ? 11 : card.value;
            return
        }
        this.players[playerIndex].points += card.value;
    }

    RestartGame() {
        // Reset all player array
        this.players = useState([]);
        this.CreatePlayers();
        this.activePlayerId = 1;
        this.StartGame();
        this.render();
    }

    PlayerHit(ev) {
        console.log(ev.detail.id);
        // Get id of current player, and make function to hit / draw card to player
        console.log("PlayerHit()");
        let playerIndex = this.GetPlayerIndex(ev.detail.id);
        console.log(playerIndex);
        console.log(this.players[playerIndex]);
        if (this.players[playerIndex].activePlayer) {
            if (this.players[playerIndex].points < this.maksPoints) {
                this.DrawCard(playerIndex);
            }
        }
    }

    GetPlayerIndex(id) {
        return this.players.findIndex(player => player.id == id);
    }

    PlayerStay(ev) {
        // Get id of current player, and make function to switch to other player.
        if(this.props.length > ev.detail.id){
            this.players[this.GetPlayerIndex(ev.detail.id)].activePlayer = false;
            this.players[this.GetPlayerIndex(ev.detail.id+1)].activePlayer = true;
        }
        else {
            // ToDo: Fix this, so that the player gets a notification
            console.log("Finish");
        }
    }

    CheckPlayerStatus(){
        console.log(this.players.every(player => player.points === 21));
    }
}