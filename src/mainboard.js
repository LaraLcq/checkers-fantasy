import React, { Component } from 'react';
import avatar_red from './assets/avatar_red.png';
import avatar_blue from './assets/avatar_blue.png';
import heart from './assets/heart.png';
import star from './assets/star.png';
// import GameLogic from './game_logic';

export default class Mainboard extends Component {

  constructor(){
    super();

    this.state = {
      board: {},
      selected: '',
      legalMove: [],
      mandatory: [],
      colNames: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    }
    const colNames = this.state.colNames;
    for(let row = 0; row < 8; row++){
      for(let col = 0; col < 8; col++){
        let id = colNames[col] + (row+1);
        this.state.board[id] = {
          color: (row+col)%2 ? 'light' : 'dark',
          id: colNames[col] + (row+1),
          content: '',
          pieceColor: '',
          highlighted: false,
          queen: false
        };
      }
    }
  }

  componentDidMount(){
    const reds = ['A1', 'A3', 'B2', 'C1', 'C3', 'D2', 'E1', 'E3', 'F2', 'G1', 'G3', 'H2'];
    const blues = ['A7', 'B6', 'B8', 'C7', 'D6', 'D8', 'E7', 'F6', 'F8', 'G7', 'H6', 'H8'];
    reds.forEach(pos => this.changePiece(pos, <div className="red checker"></div>, 'red', false));
    blues.forEach(pos => this.changePiece(pos, <div className="blue checker"></div>, 'blue', false));
  }

  playAudio() {
    let audio1 = document.getElementById("audioID");
    audio1.play();
  }

  changePiece(id, content, color, isQueen){
    let newBoard = this.state.board;
    newBoard[id].content = content
    newBoard[id].pieceColor = color;
    newBoard[id].queen = isQueen;
    this.setState({board: newBoard});
  }

  handleClick(id){
    id.preventDefault();
     let choice = (id.currentTarget.id);
     if(this.state.board[choice].content === ''){
       this.handleEmpty(choice)
     }
     else {
       this.handleOccupied(choice)
     }
  }

  handleEmpty(choice){

    if(this.state.selected){
      if((this.state.mandatory.length !== 0) && (this.state.mandatory.indexOf(this.state.selected + choice ) === -1)) {
        console.log("u have to capture smthg u fool")
        return;
      }
      let index = this.state.legalMove.indexOf(choice)
      if(index !== -1){
        let newBoard = {...this.state.board};
        this.state.legalMove.forEach(element => {newBoard[element].highlighted = false});
        this.setState({board: newBoard});
        let selected = this.state.board[this.state.selected];
        let pieceColor = selected.pieceColor;

        let row_origin = parseInt(this.state.selected.substring(1));
        let row_destination = parseInt(choice.substring(1));

        if(row_destination === 8 && pieceColor === 'red'){
          this.changePiece(choice, <div className="red-queen checker"></div>, pieceColor, true)

        }

        else if(row_destination === 1 && pieceColor === 'blue'){
          this.changePiece(choice, <div className="blue-queen checker"></div>, pieceColor, true)

        }

        else {
          this.changePiece(choice, selected.content, pieceColor, selected.queen);
        }

        if (Math.abs(row_origin - row_destination) > 1) {
          let column_origin = this.state.colNames.indexOf(this.state.selected.substring(0, 1));
          let column_destination = this.state.colNames.indexOf(choice.substring(0, 1));


          this.changePiece((this.state.colNames[(column_origin + column_destination) / 2] + ((row_origin + row_destination) / 2)) , '', '', false);
        }
        this.changePiece(this.state.selected, '', '', false);
        this.setState({legalMove: []});
        this.setState({mandatory: []});
      }
      else
        console.log('move pas legal')

    }
  }


  async handleOccupied(choice){
     await this.setState({selected: choice});
     for(let square in this.state.board){
       if(this.state.board[square].pieceColor === this.state.board[choice].pieceColor)
         this.mandatoryMove(this.state.board[square]);

     }
     let legalMove = this.possibleMove();
     this.setState({legalMove: legalMove});
     let newBoard = {...this.state.board};
     for(let square in newBoard){
       newBoard[square].highlighted = legalMove.includes(square);
     }
     console.log(this.state.mandatory);
     this.setState({board: newBoard});
   }

   mandatoryMove(cell) {
       //console.log(cell);
       let letter = cell.id.substring(0,1);
       let column = this.state.colNames.indexOf(letter) + 1;
       let row = parseInt(cell.id.substring(1));
       let pieceColor = cell.pieceColor;

       let moveUpperLeft = this.state.board[this.state.colNames[column - 2] + (row - 1)];
       let moveUpperRight = this.state.board[this.state.colNames[column] + (row - 1)];
       let moveLowerLeft = this.state.board[this.state.colNames[column - 2] + (row + 1)];
       let moveLowerRight = this.state.board[this.state.colNames[column] + (row + 1)];

       if ((pieceColor === 'red' || cell.queen) && (column - 3 >= 0) && (row < 7) && ((moveLowerLeft.pieceColor !== pieceColor) && moveLowerLeft.content !== '') &&  (this.state.board[(this.state.colNames[column - 3] + (row + 2))].content === '')) {

         if(this.state.mandatory.indexOf(cell.id + this.state.colNames[column - 3] + (row + 2)) === -1) {
           let newMandatory = this.state.mandatory;
           newMandatory.push(cell.id + this.state.colNames[column - 3] + (row + 2))
           this.setState({mandatory: newMandatory});
         }
       }

       if ((pieceColor === 'red' || cell.queen) && (column < 7) && (row < 7) && ((moveLowerRight.pieceColor !== pieceColor) && moveLowerRight.content !== '') &&  (this.state.board[(this.state.colNames[column + 1] + (row + 2))].content === '')) {

         if(this.state.mandatory.indexOf(cell.id + this.state.colNames[column + 1] + (row + 2)) === -1) {
           let newMandatory = this.state.mandatory;
           newMandatory.push(cell.id + this.state.colNames[column + 1] + (row + 2))
           this.setState({mandatory: newMandatory});
         }
       }

       if ((pieceColor === 'blue' || cell.queen) && (column - 3 >= 0) && (row > 2) && ((moveUpperLeft.pieceColor !== pieceColor) && moveUpperLeft.content !== '') &&  (this.state.board[(this.state.colNames[column - 3] + (row - 2))].content === '')) {

         if(this.state.mandatory.indexOf(cell.id + this.state.colNames[column - 3] + (row - 2)) === -1) {
           let newMandatory = this.state.mandatory;
           newMandatory.push(cell.id + this.state.colNames[column - 3] + (row - 2))
           this.setState({mandatory: newMandatory});
         }
       }

       if ((pieceColor === 'blue' || cell.queen) && (column < 7) && (row > 2) && ((moveUpperRight.pieceColor !== pieceColor) && moveUpperRight.content !== '') &&  (this.state.board[(this.state.colNames[column + 1] + (row - 2))].content === '')) {

         if(this.state.mandatory.indexOf(cell.id + this.state.colNames[column + 1] + (row - 2)) === -1) {
           let newMandatory = this.state.mandatory;
           newMandatory.push(cell.id + this.state.colNames[column + 1] + (row - 2))
           this.setState({mandatory: newMandatory});
         }
       }
     }

  possibleMove(){
    let selected = this.state.board[this.state.selected];
    let pieceColor = selected.pieceColor;
    let letter = this.state.selected.substring(0,1);
    let column = this.state.colNames.indexOf(letter) + 1;
    let row = parseInt(this.state.selected.substring(1));
    let legalMove = [];

    let moveUpperLeft = this.state.colNames[column - 2] + (row - 1);
    let moveUpperRight = this.state.colNames[column] + (row - 1);
    let moveLowerLeft = this.state.colNames[column - 2] + (row + 1);
    let moveLowerRight = this.state.colNames[column] + (row + 1);

    if(((column - 2 >= 0) && (row < 8) && (this.state.board[moveLowerLeft].content === '' ) && (pieceColor === 'red' || selected.queen)) || ((pieceColor === 'red' || selected.queen) && (column - 3 >= 0) && (row < 7) && (this.state.board[moveLowerLeft].pieceColor !== pieceColor) &&   (this.state.board[(this.state.colNames[column - 3] + (row + 2))].content === ''))){
      if(this.state.board[moveLowerLeft].content === '')
        legalMove.push(moveLowerLeft);

      else
        legalMove.push((this.state.colNames[column - 3] + (row + 2)));
    }

    if(((column < 8) && (row < 8) && (this.state.board[moveLowerRight].content === '') && (pieceColor === 'red' || selected.queen)) || ((pieceColor === 'red' || selected.queen) && (column < 7) && (row < 7) && (this.state.board[moveLowerRight].pieceColor !== pieceColor) && (this.state.board[(this.state.colNames[column + 1] + (row + 2))].content === ''))){
      if(this.state.board[moveLowerRight].content === '')
        legalMove.push(moveLowerRight);

      else
        legalMove.push((this.state.colNames[column + 1] + (row + 2)));
    }

    if(((column - 2 >= 0) && (row >= 2) && (this.state.board[moveUpperLeft].content === '') && (pieceColor === 'blue' || selected.queen)) || ((pieceColor === 'blue' || selected.queen) && (column - 3 >= 0) && (row > 2) && (this.state.board[moveUpperLeft].pieceColor !== pieceColor) && (this.state.board[(this.state.colNames[column - 3] + (row - 2))].content === ''))){
      if(this.state.board[moveUpperLeft].content === '')
        legalMove.push(moveUpperLeft);

      else
        legalMove.push((this.state.colNames[column - 3] + (row - 2)));
    }

    if(((column < 8) && (row >= 2) && (this.state.board[moveUpperRight].content === '') && (pieceColor === 'blue' || selected.queen)) || ((pieceColor === 'blue' || selected.queen) && (column < 7) && (row > 2) && (this.state.board[moveUpperRight].pieceColor !== pieceColor) && (this.state.board[(this.state.colNames[column + 1] + (row - 2))].content === ''))){
      if(this.state.board[moveUpperRight].content === '')
        legalMove.push(moveUpperRight);

      else
        legalMove.push((this.state.colNames[column + 1] + (row - 2)));
    }
    return legalMove;
  }




  render() {
    return (
      <>
      <audio id="audioID">
        <source src="http://iss240.net/tempfiles/menu-click/1.ogg" type="audio/ogg"/>
        <source src="http://iss240.net/tempfiles/menu-click/1.mp3" type="audio/mpeg"/>
      Your browser does not support the audio element.
      </audio>
      <div className="container-fluid ">
        <div className="row">
          <div className="col-2 align-self-start content-ui" id="perso-left">
              <img src={avatar_red} alt="avatar_red" className="first-pers" />
              <img src={heart} alt ="heart" className="heart" />
              <img src={star} alt ="star" className="star" />
          </div>
        <div className="col align-self-center" id="mainboard">
          <div id="checker-board">
            {Object.keys(this.state.board).map(key => {
              let square = this.state.board[key];
              return (
                <div className={`square ${square.color}${square.highlighted ? ' highlighted' : ''}`} id={square.id} key={square.id} onClick={this.handleClick.bind(this)} onMouseEnter={this.playAudio}>{square.content}
              </div>
            )})}
          </div>
        </div>
        <div className="col-2 align-self-end">
            <img src={avatar_blue} alt="avatar_blue" className="second-pers" />
            <img src={heart} alt ="heart" className="heart" />
            <img src={star} alt ="star" className="star" />
        </div>
      </div>
    </div>
    </>
    );
  }
}
