import Notification from '@/models/Notification';

export async function createNotification({ userId, type, message, issueId, title }) {
    try {
        const notification = new Notification({
            user: userId,
            title: title || 'System Notification',
            message: message,
            type: mapType(type),
            relatedIssue: issueId
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

function mapType(type) {
    const mapping = {
        'NEW_ASSIGNMENT': 'assignment',
        'STATUS_CHANGE': 'status_change',
        'ISSUE_UPDATE': 'issue_update',
        'COMMENT': 'comment'
    };
    return mapping[type] || 'system';
}
