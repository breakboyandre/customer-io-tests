import axios from 'axios';
import * as fs from 'fs/promises';
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
const broadCastData = {"start_date_text":"26 - 27 de April","start_time_text":"19:00","topic_title":"UX Design e UX Writing: carreira, migração e mercado de trabalho","webinar_name":"UX Design e UX Writing: carreira, migração e mercado de trabalho","is_public":true,"utm_campaign":"marathon_1798_product-maratona-2023-04-26-27_email_reminder_triggered_2days_2023-04","lms_landing_url":"https://ebaconline.com.br","speakers":[{"image_url":"https://ebaconline.com.br/upload/cms/FyW8qdAantxaieQmtPaV3.png","name":"Juliana Rocha","subtitle":"Gerente de Projeto na Obramax - Grupo Adeo"},{"image_url":"https://ebaconline.com.br/upload/cms/firz67WazhnAmMpgwFENi.png","name":"Camille Pezzino","subtitle":"UX Writer e UX Researcher"}],"topics":[{"date_month":"abril","date_day":"26","date_hours":"19","date_minutes":"00","title":"Dia 1 – 26/04: Migração para a área de Produtos Digitais: será que é pra mim?","speaker_name":"Juliana Rocha"},{"date_month":"abril","date_day":"27","date_hours":"19","date_minutes":"00","title":"Dia 2 – 27/04: Eu escrevo, e agora? Carreira, migração e primeira chance no mercado","speaker_name":"Camille Pezzino"}],"topics_count":2};
(async function app(){
    for(const templateNameToSend of templateNamesToSend){
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
        console.log(`Broadcast action update result: ${JSON.stringify(updateBroadcastActionResult)}\n`);
        const triggerBroadcastResult = await triggerBroadcast({
            broadcast_id: broadCastId,
            segment_id: segmentId,
            data: broadCastData
        });
        console.log(`Broadcast trigger result: ${JSON.stringify(triggerBroadcastResult)}\n`);
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