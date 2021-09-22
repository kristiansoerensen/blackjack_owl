import LoadXML from "./utils/LoadXML.js";
const template = await LoadXML('../xml/Player.xml', import.meta.url);

const { Component, mount } = owl;
const { xml } = owl.tags;

const PLAYER_TEMPLATE = xml `${template}`; 

export class Player extends Component {
    static template = PLAYER_TEMPLATE;
    static props = ["player"];

    PlayerHit() {
      console.log(this.props);
      this.trigger("toggle-hit", {id: this.props.player.id});
    }

    PlayerStay() {
      this.trigger("toggle-stay", {id: this.props.player.id});
    }
  }