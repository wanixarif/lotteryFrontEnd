import './App.css';
import web3 from './web3';
import { Component } from 'react';
import lottery from './lottery'


class App extends Component{

  state={
    manager:'',
    currentUser:'',
    participants:[],
    balance:'',
    value:'',
    message:'',
    txUrl:'',
    winner:''
  }

  async componentDidMount(){
    await window.ethereum.enable();
    const currentUser=(await web3.eth.getAccounts())[0]
    const manager= await lottery.methods.manager().call()
    const participants= await lottery.methods.viewParticipants().call()
    const balance = await web3.eth.getBalance(lottery.options.address)
    this.setState({currentUser,manager,participants, balance})
    
  }

  onSubmit=async event=>{
    event.preventDefault()
    this.setState({message:'Waiting for transaction success'})
    try {
      const txhash=await lottery.methods.enterLottery().send({from:this.state.currentUser,value:web3.utils.toWei(this.state.value,'ether')})

      const blockScanUrl='https://rinkeby.etherscan.io/tx/'+txhash['transactionHash']
      this.setState({message:`Transaction successful.`})
      this.setState({txUrl:blockScanUrl})

      
    } catch (error) {
      this.setState({message:'Transaction failed: '+error['message']})
    
      
    }
    
  }

  pickWinner=async()=>{
    this.setState({winner:'Please wait while the transaction completes'})
      if (this.state.currentUser==this.state.manager){
        await lottery.methods.pickWinner().send({from:this.state.currentUser})
        const winner=await lottery.methods.winner
        this.setState({winner:`Winner is ${winner}`})
      }
      else {
        this.setState({winner:'You\'re not allowed to call this function'})
      }
  }

  render() {
    if (!this.state.currentUser){
      return <h1>Loading account info...</h1>
    }
      
    return(
      <div>
        <h3>Hi {this.state.currentUser}</h3>
        <h4>Manager of this lottery is {this.state.manager}</h4>
        <h4>Current participants in the lottery pool are: {this.state.participants}</h4>
        <h4>There are currently {this.state.participants.length} participants competing to win {web3.utils.fromWei(this.state.balance,'ether')} ethereum</h4>


        <hr/>
        <h5>Wanna try your luck?</h5>
        <form onSubmit={this.onSubmit}>
          <label>Amount you wanna bet: </label>
          <input
              value={this.state.value}
              onChange={event=>{this.setState({value:event.target.value})}}
          />
          <br/>
          <button>Enter</button>
        </form>   
        {this.state.message} View on <a href={this.state.txUrl}>EtherScan</a>
        <div>
          <button onClick={this.pickWinner}>Pick Winner</button>
          {this.state.winner}
        </div>
   
      </div>
      

      
    );
  }
}

export default App;
