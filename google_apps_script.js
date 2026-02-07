/**
 * Aha! Project - Google Sheets Backend (v2.0 - CORS & Direct Update)
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code into Code.gs (replace everything).
 * 4. Run the 'setup' function ONCE to create necessary sheets.
 * 5. Deploy as Web App:
 *    - Click "Deploy" > "Manage deployments" > "Edit" > "New version" > "Deploy".
 *    - IMPORTANT: "Execute as" set to "Me" and "Who has access" set to "Anyone".
 */

function setup() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Questions Sheet
    let questionsSheet = ss.getSheetByName("Questions");
    if (!questionsSheet) {
        questionsSheet = ss.insertSheet("Questions");
        const headers = ["ID", "Date", "Name", "School", "Student ID", "Question", "AI Answer", "Likes Count", "Comments Count"];
        questionsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        questionsSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }

    // 2. Likes Sheet
    let likesSheet = ss.getSheetByName("Likes");
    if (!likesSheet) {
        likesSheet = ss.insertSheet("Likes");
        const headers = ["QuestionID", "StudentID", "Timestamp"];
        likesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        likesSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }

    // 3. Comments Sheet
    let commentsSheet = ss.getSheetByName("Comments");
    if (!commentsSheet) {
        commentsSheet = ss.insertSheet("Comments");
        const headers = ["QuestionID", "StudentID", "Name", "Content", "Timestamp"];
        commentsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        commentsSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }
}

function doPost(e) {
    const lock = LockService.getScriptLock();
    // Decrease lock wait time to prevent long hangs, though 10s is standard
    try {
        lock.waitLock(10000);
    } catch (e) {
        return response({ result: "error", message: "Server busy, try again" });
    }

    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();

        let data;
        try {
            data = JSON.parse(e.postData.contents);
        } catch (parseError) {
            data = e.parameter;
        }

        if (!data) return response({ result: "error", message: "No data received" });

        const action = data.action || 'create_question';
        const timestamp = new Date();

        if (action === 'create_question') {
            const sheet = ss.getSheetByName("Questions");
            const id = Utilities.getUuid();

            sheet.appendRow([
                id,
                timestamp,
                data.name,
                data.school || "",
                data.studentId,
                data.question,
                data.answer || "",
                0, // Likes
                0  // Comments
            ]);

            return response({ result: "success", id: id, message: "Question created" });

        } else if (action === 'toggle_like') {
            const likesSheet = ss.getSheetByName("Likes");
            const questionsSheet = ss.getSheetByName("Questions");
            const questionId = data.questionId;
            const studentId = data.studentId;

            let isLiked = false;
            let rowIndexToDelete = -1;

            // Check existing like
            const rows = likesSheet.getDataRange().getValues();
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][0] == questionId && rows[i][1] == studentId) {
                    rowIndexToDelete = i + 1;
                    isLiked = true;
                    break;
                }
            }

            if (isLiked) {
                likesSheet.deleteRow(rowIndexToDelete);
            } else {
                likesSheet.appendRow([questionId, studentId, timestamp]);
            }

            // Update Count
            const qRows = questionsSheet.getDataRange().getValues();
            let qRowIndex = -1;
            let currentLikes = 0;

            for (let i = 1; i < qRows.length; i++) {
                if (qRows[i][0] == questionId) {
                    qRowIndex = i + 1;
                    currentLikes = Number(qRows[i][7]) || 0;
                    break;
                }
            }

            let newCount = currentLikes;
            if (qRowIndex > 0) {
                newCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
                questionsSheet.getRange(qRowIndex, 8).setValue(newCount);
            }

            return response({
                result: "success",
                type: isLiked ? "unliked" : "liked",
                newCount: newCount
            });

        } else if (action === 'add_comment') {
            const commentsSheet = ss.getSheetByName("Comments");
            const questionsSheet = ss.getSheetByName("Questions");

            commentsSheet.appendRow([
                data.questionId,
                data.studentId,
                data.name,
                data.content,
                timestamp
            ]);

            // Update Count
            const qRows = questionsSheet.getDataRange().getValues();
            let qRowIndex = -1;
            let currentComments = 0;

            for (let i = 1; i < qRows.length; i++) {
                if (qRows[i][0] == data.questionId) {
                    qRowIndex = i + 1;
                    currentComments = Number(qRows[i][8]) || 0;
                    break;
                }
            }

            let newCount = currentComments;
            if (qRowIndex > 0) {
                newCount = currentComments + 1;
                questionsSheet.getRange(qRowIndex, 9).setValue(newCount);
            }

            return response({ result: "success", newCount: newCount, message: "Comment added" });
        }

        return response({ result: "error", message: "Invalid action" });

    } catch (e) {
        return response({ result: "error", error: e.toString() });
    } finally {
        lock.releaseLock();
    }
}

function doGet(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(5000); // Try to get lock for reads too if high concurrency, but optional for simple reads

    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();

        // 1. Get Questions
        const qSheet = ss.getSheetByName("Questions");
        if (!qSheet) return response([]); // Questions sheet missing
        const qRows = qSheet.getDataRange().getValues();
        qRows.shift(); // Remove headers

        // 2. Get Likes
        const lSheet = ss.getSheetByName("Likes");
        const lRows = lSheet ? lSheet.getDataRange().getValues() : [];
        if (lRows.length > 0) lRows.shift();

        const likesMap = {};
        lRows.forEach(row => {
            const qId = row[0];
            likesMap[qId] = (likesMap[qId] || 0) + 1;
        });

        // 3. Get Comments
        const cSheet = ss.getSheetByName("Comments");
        const cRows = cSheet ? cSheet.getDataRange().getValues() : [];
        if (cRows.length > 0) cRows.shift();

        const commentsMap = {};
        cRows.forEach(row => {
            const qId = row[0];
            if (!commentsMap[qId]) commentsMap[qId] = [];
            commentsMap[qId].push({
                studentId: row[1],
                name: row[2],
                content: row[3],
                timestamp: row[4]
            });
        });

        const questions = qRows.map(row => {
            const qId = row[0];
            return {
                id: qId,
                timestamp: row[1],
                userDisplayName: row[2],
                school: row[3],
                studentId: row[4],
                content: row[5],
                answer: row[6],
                likes: likesMap[qId] || 0, // Calculate from Likes sheet for accuracy
                comments: commentsMap[qId] || [],
                commentsCount: (commentsMap[qId] || []).length,
                userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row[2])}`
            };
        }).reverse();

        return response(questions);

    } catch (e) {
        return response({ result: "error", error: e.toString() });
    } finally {
        lock.releaseLock();
    }
}

function response(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
