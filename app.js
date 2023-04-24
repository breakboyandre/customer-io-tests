import axios from 'axios';
import * as fs from 'fs/promises';
import {createWriteStream} from 'fs';
//These templates will be sent to our segment users (segment has 2 users only for tests)
const templateNamesToSend = [
    '2-days.html',
    '10-hours.html',
    '1-hour.html',
    'on-air.html',
    'follow-up-1.html',
    'follow-up-2.html',
];
const apiUrl = 'https://api-eu.customer.io/v1';
const appApiBearerToken = 'ASK_ME_IF_YOU_NEED';
const broadCastId = 34; //This broadcast will be used for triggering
const broadCastActionId = 110; //This is the only action of the broadcast (ID 34). We'll be updating action's body with templates before triggering broadcast.
const segmentId = 644; //All letters will be sent to the people of this segment
const fromId = 1; // info@ebaconline.com.br

(async function app(){

    const broadCastData = await fs.readFile(`./broadcast-payload.json`, 'utf8'); //Payload for all broadcasts
    for(const templateNameToSend of templateNamesToSend){
        const logFileStream = createWriteStream(`./results/${templateNameToSend}.log`, {flags: 'w'});
        const templateHtml = await fs.readFile(`./templates/${templateNameToSend}`, 'utf8');
        console.log(templateNameToSend);
        const updateBroadcastActionResult = await updateBroadcastAction({
            broadcast_id: broadCastId,
            action_id: broadCastActionId,
            data: {
                body: templateHtml,
                from_id: fromId,
                subject: `${templateNameToSend} Subject`,
                preheader_text: `${templateNameToSend} Preheader Text`
            }
        });
        logFileStream.write(`Broadcast action update result:\n${JSON.stringify(updateBroadcastActionResult)}\n\n`);
        const broadcastAction = await getBroadcastAction({
            broadcast_id: broadCastId,
            action_id: broadCastActionId,
        });
        logFileStream.write(`Broadcast action after updating:\n${JSON.stringify(broadcastAction)}\n\n`);

        const triggerBroadcastResult = await triggerBroadcast({
            broadcast_id: broadCastId,
            segment_id: segmentId,
            data: broadCastData
        });

        logFileStream.write(`Broadcast trigger result:\n${JSON.stringify(triggerBroadcastResult)}\n\n`);
        logFileStream.end();
        await new Promise(resolve => setTimeout(resolve, 11000));
    }
})();
const updateBroadcastAction = async ({broadcast_id, action_id, data}) => {
    const result = await axios({
        url: `${apiUrl}/broadcasts/${broadcast_id}/actions/${action_id}`,
        method: "PUT",
        data: data,
        headers: {Authorization: `Bearer ${appApiBearerToken}`}
    });
    return result.data;
}
const triggerBroadcast = async ({broadcast_id, segment_id, data = {}}) => {
    const result = await axios({
        url: `${apiUrl}/campaigns/${broadcast_id}/triggers`,
        method: "POST",
        data: {
            recipients: {
                segment: {
                    id: segment_id
                }
            },
            data,
        },
        headers: {Authorization: `Bearer ${appApiBearerToken}`}
    });
    return result.data;
}
const getBroadcastAction = async ({broadcast_id, action_id}) => {
    const result = await axios({
        url: `${apiUrl}/broadcasts/${broadcast_id}/actions/${action_id}`,
        method: "GET",
        headers: {Authorization: `Bearer ${appApiBearerToken}`}
    });
    return result.data;
}