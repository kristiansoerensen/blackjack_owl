import LoadXML from "./utils/LoadXML.js";
import {cards} from "./lib/cards.js";
import {Player} from "./Player.js";
const template = await LoadXML('../xml/GameBoard.xml', import.meta.url);

const { Component } = owl;
const { xml } = owl.tags;
const { useState } = owl.hooks;

const GAMEBOARD_TEMPLATE = xml `${template}`;

export class GameBoard extends Component {
    static template = GAMEBOARD_TEMPLATE;
    static components = {Player};

    players = useState([]);
    deck = [];
    deckCount = useState({ value: 0 });
    maksPoints = 21;
    firstRound = true;

    cardBack = "\uD83C\uDCA0";

    CreatePlayers() {
        this.players.push({
            id: 0,
            name: "Dealer / House",
            points: 0,
            activePlayer: false,
            hand: [],
            status: "",
        });
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

    async StartGame() {
        this.ShuffleDeck()
        for (const key in this.players) {
            this.DrawCard(key);
            this.DrawCard(key);
        }
        this.firstRound = true;
        let winners = this.CheckPlayerStatus();
        if (winners !== false) {
            this.players[this.GetPlayerIndex(1)].activePlayer = false;
            this.players[this.GetPlayerIndex(0)].activePlayer = true;
            await this.ShowWinners(winners);
        }
    }

    ShowWinners(winners) {
        let winnerstring = "Winner(s): "; 
        winners.forEach(win => winnerstring += "\n" + this.players[win].name);
        this.deckCount.value = winnerstring;
    }

    ShuffleDeck() {
        for (let i = this.deck.length; i > -1; i--) {
            this.deck.pop(i);
        }
        let tempDeck = cards;
        for (let _ = 0; _ < 100; _++) {
            for (let i = tempDeck.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * i);
                let temp = tempDeck[i];
                tempDeck[i] = tempDeck[j];
                tempDeck[j] = temp;
            }
        }
        tempDeck.forEach(element => {
            this.deck.push(element);
        });
        this.deckCount.value = this.deck.length;
    }

    DrawCard(playerIndex) {
        let card = this.deck.shift();
        this.players[playerIndex].hand.push(card);
        this.players[playerIndex].points = this.CountCardPoints(this.players[playerIndex].hand);
        this.deckCount.value = this.deck.length;
    }

    CountCardPoints(hand){
        let noAceTotal = 0;
        hand.forEach(card => noAceTotal += card.cardId !== "A" ? card.value : 0);

        let aces = hand.filter(card => card.cardId === "A").length;

        if (aces.length === 0 && aces > 1) {
            let total = noAceTotal;
            if (aces.length > 1) {
                for (let i = 0; i < aces; i++) {
                    total += 1;
                }
            }
            return total;
        }
        if (aces === 1 && noAceTotal <= 10) {
            return noAceTotal += 11;
        }
        else {
            for (let i = 0; i  < aces; i++) {
                noAceTotal += 1;
            }
        }
        return noAceTotal;
    }

    RestartGame() {
        // Reset all player array
        for (let i = this.players.length; i > -1; i--) {
            this.players.pop(i);
        }
        this.CreatePlayers();
        this.StartGame();
        this.render();
    }

    PlayerHit(ev) {
        // Get id of current player, and make function to hit / draw card to player
        let playerIndex = this.GetPlayerIndex(ev.detail.id);
        if (this.players[playerIndex].activePlayer) {
            if (this.players[playerIndex].points < this.maksPoints) {
                this.DrawCard(playerIndex);
            }
        }
        if (this.firstRound) {
            this.firstRound = false;
            return;
        }
        if (this.players[playerIndex].points >= 21) {
            this.NextPlayer(ev.detail.id);
        }
    }

    NextPlayer(id) {
        if(this.props.length > id){
            this.players[this.GetPlayerIndex(id)].activePlayer = false;
            this.players[this.GetPlayerIndex(id+1)].activePlayer = true;
        }
        else {
            this.players[this.GetPlayerIndex(id)].activePlayer = false;
            this.players[this.GetPlayerIndex(0)].activePlayer = true;
            this.DealerHouse();
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Dealer / House function
    async DealerHouse() {
        let dealerObj = this.players[this.GetPlayerIndex(0)];
        if(dealerObj.activePlayer) {
            while (this.CountCardPoints(dealerObj.hand) < 17) {
                await this.sleep(1000);
                this.DrawCard(0);
            }
        }
        let numArray = [];
        this.players.forEach(player => { 
            if (player.points < 22) {
                numArray.push(parseInt(player.points));
            }
        });
        let largestNumber = Math.max(...numArray);
        console.log(Math.max(largestNumber));
        let allMatchingLargestNum = this.players.filter(player => parseInt(player.points) === largestNumber);

        console.log(allMatchingLargestNum);
        if (allMatchingLargestNum.length === 1) {
            if (allMatchingLargestNum[0].id === 0){
                this.deckCount.value = "House Wins!";
            }
            else {
                this.deckCount.value = "Winner: \n" + allMatchingLargestNum[0].name;
            }
        }
        else {
            let winnersStr = "Winners:";
            for (const key in allMatchingLargestNum) {
                if (allMatchingLargestNum[key].id !== 0){
                    winnersStr += "\n" + allMatchingLargestNum[key].name;
                }
            }

            this.deckCount.value = winnersStr;
        }
        
    }

    GetPlayerIndex(id) {
        return this.players.findIndex(player => player.id == id);
    }

    PlayerStay(ev) {
        // Get id of current player, and make function to switch to other player.
        this.NextPlayer(ev.detail.id);
    }

    CheckPlayerStatus(){
        let winners = [];
        for (const key in this.players) {
            if (this.players[key].points === 21 && key !== "0") {
                winners.push(parseInt(key));
            }
        }
        return winners.length !== 0 ? winners : false;
    }


}