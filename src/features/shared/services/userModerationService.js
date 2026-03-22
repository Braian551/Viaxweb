import { API_BASE_URL } from '../../../config/env';
import { requestJson } from '../../../config/httpClient';

export const reportUser = async ({ reporterUserId, reportedUserId, solicitudId, motivo, descripcion, prioridad = 'media' }) => {
    return await requestJson(
        `${API_BASE_URL}/user/report_user.php`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                reporter_user_id: reporterUserId,
                reported_user_id: reportedUserId,
                solicitud_id: solicitudId,
                motivo,
                descripcion,
                prioridad,
            }),
        },
        'No se pudo enviar el reporte del usuario'
    );
};
