const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt  } = require('botbuilder-dialogs');

const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const {CardFactory} = require('botbuilder');
 
const mobileCard = require('../resources/adaptiveCards/mobileCard');
 
const CARDS = [
 
   mobileCard
];

const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const NUMBER_PROMPT    = 'NUMBER_PROMPT';
const DATETIME_PROMPT  = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog ='';

class MobileSupportDialog extends ComponentDialog {
    
    constructor(conservsationState,userState) {
        super('mobileSupportDialog');



this.addDialog(new TextPrompt(TEXT_PROMPT));
this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
this.addDialog(new NumberPrompt(NUMBER_PROMPT));
this.addDialog(new DateTimePrompt(DATETIME_PROMPT));


this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
    this.firstStep.bind(this),  // Ask confirmation if user wants to make reservation?
    this.getmobileSupport.bind(this),
    this.getName.bind(this),
    this.confirmStep.bind(this), // Show summary of values entered by user and ask confirmation to make reservation
    this.summaryStep.bind(this)
           
]));




this.initialDialogId = WATERFALL_DIALOG;


   }

   async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
        await dialogContext.beginDialog(this.id);
    }
}

async firstStep(step) {
    console.log("dwwwwwwwwwwwwwwwww")
    console.log(step)
    console.log(step.dialogs)

endDialog = false;
// Running a prompt here means the next WaterfallStep will be run when the users response is received.
await step.context.sendActivity({
    text:'Samsung Mobile:',
    attachments: [CardFactory.adaptiveCard(CARDS[0])]
});
// Running a prompt here means the next WaterfallStep will be run when the users response is received.
return await step.prompt(CONFIRM_PROMPT, 'Would you like to Continue with Mobile Support?', ['yes', 'no']);
      
}

async getmobileSupport(step){
    
    console.log(step.result)
    console.log(step)
    if(step.result === true)
    { 
return await step.prompt(CHOICE_PROMPT,'Please choose the Support From the listed below', ['NearestServiceCenter','ForBookingOnline','ExtendedWarranty']);
    }

    if(step.result === false)
    { 
        await step.context.sendActivity("You chose not to go ahead with Mobile Support.");
        endDialog = true;
        return await step.endDialog();   
    }

}

async getName(step){
    
    if(step.result.value === 'NearestServiceCenter')
    { 

        return await step.prompt(TEXT_PROMPT, 'Please Enter your Pincode');
      
    }
    

    else if(step.result.value === 'ForBookingOnline')
    { 
        //return await step.prompt(TEXT_PROMPT, 'Please Enter Your Product_Key No:');
        await step.context.sendActivity("You can Book online by going through the following link https://www.Samsung.com/Mobiles");
        endDialog = true;
        return await step.endDialog(); 
    
        }

    else if(step.result.value === 'ExtendedWarranty')
    {
        //return await step.prompt(TEXT_PROMPT,'You can purchase Extended warranty pack online by going through the following link https://www.Samsung.com/extended-warranty');
        await step.context.sendActivity("You can purchase Extended warranty pack online by going through the following link https://www.Samsung.com/extended-warranty");
        endDialog = true;
        return await step.endDialog(); 

    }

    
}




async confirmStep(step){

    step.values.time = step.result


    return await step.prompt(CONFIRM_PROMPT, 'Confirm your pincode?', ['yes', 'no']);
}

async summaryStep(step){

    if(step.result===true)
    {
      // Business 

      await step.context.sendActivity("Here are the Service Center :Shop No 7, Ravindra Tagore Nagar Main Road, Pandt Colony, Ganganagar, Ak Colony, Bengaluru, Karnataka 560032")
      endDialog = true;
      console.log(step)
      return await step.endDialog();   
    
    }

    
    


   
}



async isDialogComplete(){
    return endDialog;
}
}

module.exports.MobileSupportDialog = MobileSupportDialog;








