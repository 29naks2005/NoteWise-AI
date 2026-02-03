import { noteStyles } from './noteStyles';

export const downloadNoteAsHtml = (note) => {
    if (!note) return;

    const content = note.content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${note.articleTitle}</title>
    <style>${noteStyles}</style>
</head>
<body>
    <h1>${note.articleTitle}</h1>
    <div class="meta">
        <strong>Type:</strong> ${note.type === 'summary' ? 'Summary' : 'Notes'} | 
        <a href="${note.articleUrl}" target="_blank">View Original</a>
    </div>
    <div class="content">${content}</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${note.articleTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 30)}.html`;
    link.click();
};
