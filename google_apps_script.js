
/**
 * Aha! Project - Google Sheets Backend
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code into Code.gs (replace everything).
 * 4. Run the 'setup' function ONCE to create necessary sheets.
 *    (It will create 'Questions', 'Likes', 'Comments' sheets if they don't exist)
 * 5. Deploy as Web App:
 *    - Click "Deploy" > "Manage deployments" > "Edit" > "New version" > "Deploy".
 *    - OR "New deployment" if starting fresh.
 */

function setup() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Questions Sheet
    // Structure: ID (Hidden/System), Date, Name, School, Student ID, Question, AI Answer, Likes Count, Comments Count
    let questionsSheet = ss.getSheetByName("Questions");
    if (!questionsSheet) {
        questionsSheet = ss.insertSheet("Questions");
        const headers = ["ID", "Date", "Name", "School", "Student ID", "Question", "AI Answer", "Likes Count", "Comments Count"];
        questionsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        questionsSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }

    // 2. Likes Sheet [QuestionID, StudentID, Timestamp]
    let likesSheet = ss.getSheetByName("Likes");
    if (!likesSheet) {
        likesSheet = ss.insertSheet("Likes");
        const headers = ["QuestionID", "StudentID", "Timestamp"];
        likesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        likesSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }

    // 3. Comments Sheet [QuestionID, StudentID, Name, Content, Timestamp]
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
    lock.tryLock(10000);

    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();

        // Parse data
        let data;
        try {
            data = JSON.parse(e.postData.contents);
        } catch (parseError) {
            data = e.parameter;
        }

        if (!data) throw new Error("No data received");

        const action = data.action || 'create_question';
        const timestamp = new Date();

        if (action === 'create_question') {
            const sheet = ss.getSheetByName("Questions");
            // Generate a unique ID (UUID)
            const id = Utilities.getUuid();

            // Headers: ID, Date, Name, School, Student ID, Question, AI Answer, Likes Count, Comments Count
            sheet.appendRow([
                id,                 // ID
                timestamp,          // Date
                data.name,          // Name
                data.school || "",  // School
                data.studentId,     // Student ID
                data.question,      // Question
                data.answer || "",  // AI Answer
                0,                  // Likes Count
                0                   // Comments Count
            ]);

            return response({ result: "success", id: id });

        } else if (action === 'toggle_like') {
            const likesSheet = ss.getSheetByName("Likes");
            const questionsSheet = ss.getSheetByName("Questions");
            const questionId = data.questionId;
            const studentId = data.studentId;

            // 1. Manage Log in Likes Sheet
            const rows = likesSheet.getDataRange().getValues();
            let rowIndexToDelete = -1;
            let currentLikes = 0;
            let isLiked = false;

            // Check if already liked
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][0] == questionId && rows[i][1] == studentId) {
                    rowIndexToDelete = i + 1;
                    isLiked = true;
                    break;
                }
            }

            if (isLiked) {
                likesSheet.deleteRow(rowIndexToDelete); // Unlike
            } else {
                likesSheet.appendRow([questionId, studentId, timestamp]); // Like
            }

            // 2. Update Count in Questions Sheet
            const qRows = questionsSheet.getDataRange().getValues();
            let qRowIndex = -1;

            // Find the row with matching ID (Column A is Index 0)
            for (let i = 1; i < qRows.length; i++) { // Skip header
                if (qRows[i][0] == questionId) {
                    qRowIndex = i + 1; // 1-based index
                    // Get current likes count from Column H (Index 7)
                    // Note: If cell is empty, treat as 0
                    currentLikes = Number(qRows[i][7]) || 0;
                    break;
                }
            }

            if (qRowIndex > 0) {
                // Determine new count
                const newCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
                // Update Column H (8th column)
                questionsSheet.getRange(qRowIndex, 8).setValue(newCount);
                return response({ result: "success", type: isLiked ? "unliked" : "liked", newCount: newCount });
            }

            return response({ result: "error", message: "Question not found" });

        } else if (action === 'add_comment') {
            const commentsSheet = ss.getSheetByName("Comments");
            const questionsSheet = ss.getSheetByName("Questions");

            // 1. Add to Comments Sheet
            commentsSheet.appendRow([
                data.questionId,
                data.studentId,
                data.name,
                data.content,
                timestamp
            ]);

            // 2. Update Count in Questions Sheet
            const qRows = questionsSheet.getDataRange().getValues();
            let qRowIndex = -1;
            let currentComments = 0;

            for (let i = 1; i < qRows.length; i++) {
                if (qRows[i][0] == data.questionId) {
                    qRowIndex = i + 1;
                    currentComments = Number(qRows[i][8]) || 0; // Column I (Index 8)
                    break;
                }
            }

            if (qRowIndex > 0) {
                const newCount = currentComments + 1;
                questionsSheet.getRange(qRowIndex, 9).setValue(newCount); // Column I
                return response({ result: "success", newCount: newCount });
            }

            return response({ result: "success", message: "Comment added but count not updated (ID not found)" });
        }

        return response({ result: "error", message: "Invalid action" });

    } catch (e) {
        return response({ result: "error", error: e.toString() });
    } finally {
        lock.releaseLock();
    }
}

function doGet(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Get Questions
    const qSheet = ss.getSheetByName("Questions");
    const qRows = qSheet.getDataRange().getValues();
    qRows.shift(); // Remove headers

    // 2. Get Likes
    const lSheet = ss.getSheetByName("Likes");
    const lRows = lSheet.getDataRange().getValues();
    lRows.shift();
    // Map likes by QuestionID
    const likesMap = {}; // { questionId: count }
    lRows.forEach(row => {
        const qId = row[0];
        likesMap[qId] = (likesMap[qId] || 0) + 1;
    });

    // 3. Get Comments
    const cSheet = ss.getSheetByName("Comments");
    const cRows = cSheet.getDataRange().getValues();
    cRows.shift();
    // Map comments by QuestionID
    const commentsMap = {}; // { questionId: [comments...] }
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

    // 4. Assemble Data
    // Headers: ID(0), Date(1), Name(2), School(3), Student ID(4), Question(5), AI Answer(6), Likes Count(7), Comments Count(8)
    const questions = qRows.map(row => {
        const qId = row[0];
        return {
            id: qId,
            timestamp: row[1],
            userDisplayName: row[2], // Name
            school: row[3],          // School
            studentId: row[4],       // Student ID
            content: row[5],         // Question
            answer: row[6],          // AI Answer
            likes: likesMap[qId] || 0,
            comments: commentsMap[qId] || [],
            commentsCount: (commentsMap[qId] || []).length,
            userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row[2])}` // Use Name for seed
        };
    }).reverse();

    return response(questions);
}

function response(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
