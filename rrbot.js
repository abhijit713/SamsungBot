// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { RefrigeratorSupportDialog } = require('./componentDialogs/refrigeratorSupportDialog');
const { MobileSupportDialog } = require('./componentDialogs/mobileSupportDialog');
const { TelevisionSupportDialog } = require('./componentDialogs/televisionSupportDialog');
const { WashingmachineSupportDialog } = require('./componentDialogs/washingmachineSupportDialog');

const {LuisRecognizer , QnAMaker }  = require('botbuilder-ai');
const {CardFactory} = require('botbuilder');
 
const samsungCard = require('./resources/adaptiveCards/samsungCard');
 
const CARDS = [
 
   samsungCard
];



class SAMSUNGBOT extends ActivityHandler {
    constructor(conversationState,userState) {
        super();

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = conversationState.createProperty("dialogState");
        this.refrigeratorSupportDialog = new RefrigeratorSupportDialog(this.conversationState,this.userState);
        this.mobileSupportDialog = new MobileSupportDialog(this.conversationState,this.userState);
        this.televisionSupportDialog = new TelevisionSupportDialog(this.conversationState,this.userState);
        this.washingmachineSupportDialog = new WashingmachineSupportDialog(this.conversationState,this.userState);
        
   
        
        this.previousIntent = this.conversationState.createProperty("previousIntent");
        this.conversationData = this.conversationState.createProperty('conservationData');
        //this.testproperty=this.conversationState.createProperty('testproperty')
        

        const dispatchRecognizer = new LuisRecognizer({
            applicationId: process.env.LuisAppId,
            endpointKey: process.env.LuisAPIKey,
            endpoint: `https://${ process.env.LuisAPIHostName }.api.cognitive.microsoft.com`
        }, {
            includeAllIntents: true
        }, true);

       
        const qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.knowledgeBaseId,
            endpointKey: process.env.endpointKey,
            host: process.env.host
        }); 
    
   
        
        
        this.qnaMaker = qnaMaker;


        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

        const luisResult = await dispatchRecognizer.recognize(context)
        console.log("iamcoming")
        console.log(luisResult)
        const intent = LuisRecognizer.topIntent(luisResult); 
       
        
        const entities = luisResult.entities;

        await this.dispatchToIntentAsync(context,intent,entities);
        
        await next();

        });

    this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            console.log("onDialiog")
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });   
    this.onMembersAdded(async (context, next) => {
            await this.sendWelcomeMessage(context)
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

  

    async sendWelcomeMessage(turnContext) {
        const { activity } = turnContext;

        // Iterate over all new members added to the conversation.
        for (const idx in activity.membersAdded) {
            if (activity.membersAdded[idx].id !== activity.recipient.id) {
                const welcomeMessage = `Welcome to Samsung Customer Support ${ activity.membersAdded[idx].name }. `;
                await turnContext.sendActivity(welcomeMessage);
                await turnContext.sendActivity({
                    
                    attachments: [CardFactory.adaptiveCard(CARDS[0])]
                });
                await this.sendSuggestedActions(turnContext);
            }
        }
    }



    async sendSuggestedActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['Refrigerator Support','Mobile Support','Television Support','WashingMachine Support','Shop Address'],'I am Samsung Assistant and would be glad to help you today');
        await turnContext.sendActivity(reply);
    }


    async dispatchToIntentAsync(context,intent,entities){

        var currentIntent = '';
        console.log("hello")
        const previousIntent = await this.previousIntent.get(context,{});
        const conversationData = await this.conversationData.get(context,{}); 
        //const testproperty=await this.testproperty.get(context,{});  

        if(previousIntent.intentName && conversationData.endDialog === false )
        {
           currentIntent = previousIntent.intentName;

        }
        else if (previousIntent.intentName && conversationData.endDialog === true)
        {
             currentIntent = intent;

        }
        else if(intent == "None" && !previousIntent.intentName)
        {

            var result = await this.qnaMaker.getAnswers(context)
            console.log("-----------");
            console.log(result)
            await context.sendActivity(`${ result[0].answer}`);
            await this.sendSuggestedActions(context);
        }
        
        else
        {
            currentIntent = intent;
            await this.previousIntent.set(context,{intentName: intent});
           // await this.testproperty.set(context,{})

        }
        console.log("-----------------")
        console.log(currentIntent)
    switch(currentIntent)
    {

        case 'Refrigerator_Support':
        console.log("Inside Refrigerator Support Case");
        await this.conversationData.set(context,{endDialog: false});
       
        
        await this.refrigeratorSupportDialog.run(context,this.dialogState,entities);
        conversationData.endDialog = await this.refrigeratorSupportDialog.isDialogComplete();
        if(conversationData.endDialog)
        {
            await this.previousIntent.set(context,{intentName: null});
            await this.sendSuggestedActions(context);

        } 
        break;

        case 'Mobile_Support':
        console.log("Inside Mobile Support Case");
        await this.conversationData.set(context,{endDialog: false});
        await this.mobileSupportDialog.run(context, this.dialogState);
        conversationData.endDialog = await this.mobileSupportDialog.isDialogComplete();
        if(conversationData.endDialog)
        {
        
            await this.sendSuggestedActions(context);
            await this.previousIntent.set(context,{intentName: null});
            

        } 
        break;

        case 'Television_Support':
        console.log("Inside Television Support Case");
        await this.conversationData.set(context,{endDialog: false});
        await this.televisionSupportDialog.run(context, this.dialogState);
        conversationData.endDialog = await this.televisionSupportDialog.isDialogComplete();
        if(conversationData.endDialog)
        {
        
            await this.sendSuggestedActions(context);
            await this.previousIntent.set(context,{intentName: null});
            

        } 
        break;

        case 'WashingMachine_Support':
        console.log("Inside WashingMachine Support Case");
        await this.conversationData.set(context,{endDialog: false});
        await this.washingmachineSupportDialog.run(context, this.dialogState);
        conversationData.endDialog = await this.washingmachineSupportDialog.isDialogComplete();
        if(conversationData.endDialog)
        {
        
            await this.sendSuggestedActions(context);
            await this.previousIntent.set(context,{intentName: null});
            

        } 
        break;



        default:
            console.log("Did not match Make Reservation case");
            break;
    }


    }


}



module.exports.SAMSUNGBOT = SAMSUNGBOT;
