import Express from "express";
import controller from "./controller";
import auth from '../../../../helper/auth'
import upload from '../../../../helper/uploadHandler';


export default Express.Router()
    .get('/listStaticContent', controller.listStaticContent)
    .get('/viewStaticContent', controller.viewStaticContent)
    .get('/viewFAQ', controller.viewFAQ)
    .get('/faqList', controller.faqList)
    .post('/addContactUs', controller.addContactUs)
    .get('/viewVideo', controller.viewVideo)
    .get('/videoList', controller.videoList)
    .get('/viewNews', controller.viewNews)
    .get('/newsList', controller.newsList)
    .post('/newLetter', controller.newLetter)
    .use(auth.verifyToken)
    .post('/addStaticContent', controller.addStaticContent)
    .put('/editStaticContent', controller.editStaticContent)
    .post('/addFAQ', controller.addFAQ)
    .delete('/deleteFAQ', controller.deleteFAQ)
    .put('/editFAQ', controller.editFAQ)
    .delete('/deleteVideo', controller.deleteVideo)
    .delete('/deleteNews', controller.deleteNews)

    .use(upload.uploadFile)
    .post('/addVideo', controller.addVideo)
    .put('/editVideo', controller.editVideo)
    .post('/addNews', controller.addNews)
    .put('/editNews', controller.editNews)


