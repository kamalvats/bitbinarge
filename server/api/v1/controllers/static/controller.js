import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import { staticServices } from '../../services/static';
const { createStaticContent, findStaticContent, updateStaticContent, staticContentList } = staticServices;
import commonFunction from '../../../../helper/util';
import status from '../../../../enums/status';
import staticModel from '../../../../models/static'
import { userServices } from '../../services/user';
const { checkUserExists, emailMobileExist, createUser, findUser, findAllUser, updateUser, updateUserById, paginateSearch, insertManyUser } = userServices;
import userType from "../../../../enums/userType";
import fs from 'file-system';
import { faqServices } from '../../services/faq';
const { createFAQ, findFAQ, updateFAQ, listFaq, faqListPagination } = faqServices;
import { contactUsServices } from '../../services/contactUs'
const { createContactUs, findContactUs } = contactUsServices
import { videoServices } from "../../services/video"
const { createVideo, findVideo, updateVideo, listVideo, videoListPagination } = videoServices
import { newsServices } from "../../services/news"
const { createNews, findNews, updateNews, listNews, newsListPagination } = newsServices




export class staticController {


    /**
     * @swagger
     * /static/addStaticContent:
     *   post:
     *     tags:
     *       - STATIC
     *     description: addStaticContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token -> admin || subadmin
     *         in: header
     *         required: true
     *       - name: type
     *         description: type
     *         in: formData
     *         required: true
     *       - name: title
     *         description: title
     *         in: formData
     *         required: true
     *       - name: description
     *         description: description
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Content add successfully.
     *       404:
     *         description: User not found || Data not found.
     *       409:
     *         description: Data already exits.
     *       501:
     *         description: Something went wrong!
     */
    async addStaticContent(req, res, next) {
        const validationSchema = {
            type: Joi.string().valid('termsConditions', 'privacyPolicy', 'aboutUs', 'riskDisclosure').required(),
            title: Joi.string().optional(),
            description: Joi.string().optional()
        }
        try {
            const validateBody = await Joi.validate(req.body, validationSchema);
            const authCheck = await findUser({ _id: req.userId, status: status.ACTIVE, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!authCheck) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let checkStatic = await findStaticContent({ title: req.body.title });
                if (!checkStatic) {
                    const saveResult = await createStaticContent(validateBody);
                    return res.json(new response(saveResult, responseMessage.ADD_CONTENT));
                } else {
                    throw apiError.conflict(responseMessage.ALREADY_EXITS);
                }

            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/viewStaticContent:
     *   get:
     *     tags:
     *       - STATIC
     *     description: viewStaticContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: type
     *         description: static content type
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found || Data not found.
     *       501:
     *         description: Something went wrong!
     */
    async viewStaticContent(req, res, next) {
        const validationSchema = {
            type: Joi.string().required()
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            const data = await findStaticContent({ type: req.query.type, status: status.ACTIVE });
            if (!data) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            } else {
                return res.json(new response(data, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/listStaticContent:
     *   get:
     *     tags:
     *       - STATIC
     *     description: list static content
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found || Data not found.
     *       501:
     *         description: Something went wrong!
     */
    async listStaticContent(req, res, next) {
        try {
            const data = await staticContentList();
            if (data.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            } else {
                return res.json(new response(data, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /static/editStaticContent:
     *   put:
     *     tags:
     *       - STATIC
     *     description: Contact Us
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token -> admin || subAdmin
     *         in: header
     *         required: true
     *       - name: editStaticContent
     *         description: editStaticContent
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/editStaticContent'
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found || Data not found.
     *       501:
     *         description: Something went wrong!
     */
    async editStaticContent(req, res, next) {
        const validationSchema = {
            _id: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
        }
        try {
            const validateBody = await Joi.validate(req.body, validationSchema);
            const authCheck = await findUser({ _id: req.userId, status: status.ACTIVE, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!authCheck) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            } else {
                let CheckStatic = await findStaticContent({ _id: req.body._id });
                if (!CheckStatic) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
                } else {
                    let updateResult = await updateStaticContent({ _id: req.body._id }, (validateBody))
                    return res.json(new response(updateResult, responseMessage.UPDATE_SUCCESS));
                }

            }
        } catch (error) {
            return next(error);
        }
    }

    /**
         * @swagger
         * /static/addFAQ:
         *   post:
         *     tags:
         *       - STATIC
         *     description: addFAQ
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: token
         *         description: Admin token
         *         in: header
         *         required: true
         *       - name: addFAQ
         *         description: addFAQ
         *         in: body
         *         required: true
         *         schema:
         *           $ref: '#/definitions/addFAQ'
         *     responses:
         *       200:
         *         description: Returns success message
         */
    async addFAQ(req, res, next) {
        const validationSchema = {
            question: Joi.string().required(),
            answer: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { type, question, answer } = validatedBody;
            let findAdmin = await findUser({ _id: req.userId, userType: { $in: [userType.ADMIN, userType.SUBADMIN] }, status: status.ACTIVE })
            if (!findAdmin) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED)
            }
            else {
                var faqData = await findFAQ({ question: validatedBody.question })
                if (faqData) {
                    throw apiError.alreadyExist(responseMessage.ALREADY_EXITS);
                }
                else {
                    var result = await createFAQ(validatedBody)
                    return res.json(new response(result, responseMessage.FAQ_ADDED));
                }
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
      * @swagger
      * /static/viewFAQ:
      *   get:
      *     tags:
      *       - STATIC
      *     description: viewFAQ
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: _id
      *         description: _id
      *         in: query
      *         required: true
      *     responses:
      *       200:
      *         description: Returns success message
      */
    async viewFAQ(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var result = await findFAQ({ _id: validatedBody._id })
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/editFAQ:
    *   put:
    *     tags:
    *       - STATIC
    *     description: editFAQ
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: Admin token
    *         in: header
    *         required: true
    *       - name: editFAQ
    *         description: editFAQ
    *         in: body
    *         required: true
    *         schema:
    *           $ref: '#/definitions/editFAQ'
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async editFAQ(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
            question: Joi.string().optional(),
            answer: Joi.string().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let findAdmin = await findUser({ _id: req.userId, userType: { $in: [userType.ADMIN, userType.SUBADMIN] }, status: status.ACTIVE })
            if (!findAdmin) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED)
            }
            else {
                var result = await updateFAQ({ _id: validatedBody._id }, validatedBody)
                return res.json(new response(result, responseMessage.UPDATE_SUCCESS));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
        * @swagger
        * /static/deleteFAQ:
        *   delete:
        *     tags:
        *       - STATIC
        *     description: deleteFAQ
        *     produces:
        *       - application/json
        *     parameters:
        *       - name: token
        *         description: token of Admin
        *         in: header
        *         required: true
        *       - name: deleteFAQ
        *         description: deleteFAQ
        *         in: body
        *         required: true
        *         schema:
        *           $ref: '#/definitions/deleteFAQ'
        *     responses:
        *       200:
        *         description: Returns success message
        */
    async deleteFAQ(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            console.log(userResult);
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            var faqInfo = await findFAQ({ _id: validatedBody._id, status: { $ne: status.DELETE } });

            if (!faqInfo) {
                throw apiError.notFound(responseMessage.NOT_FOUND);
            }
            let deleteRes = await updateFAQ({ _id: faqInfo._id }, { status: status.DELETE });
            return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
        * @swagger
        * /static/faqList:
        *   get:
        *     tags:
        *       - STATIC
        *     description: faqList
        *     produces:
        *       - application/json
        *     parameters:
        *       - name: search
        *         description: search
        *         in: query
        *         required: false
        *       - name: page
        *         description: page
        *         in: query
        *         required: false
        *       - name: limit
        *         description: limit
        *         in: query
        *         required: false
        *     responses:
        *       200:
        *         description: Returns success message
        */
    async faqList(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional(),
        };
        try {
            var validatedBody = await Joi.validate(req.query, validationSchema);
            if (!validatedBody.page && !validatedBody.limit) {
                var result = await listFaq({ status: status.ACTIVE })
                if (result.length == 0) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
                }
                return res.json(new response({ docs: result }, responseMessage.DATA_FOUND));
            }
            var result = await faqListPagination(validatedBody)
            if (result.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            else {
                return res.json(new response(result, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/addContactUs:
     *   post:
     *     tags:
     *       - CONTACT US
     *     description: addContactUs
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: addContactUs
     *         description: addContactUs
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/addContactUs'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async addContactUs(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
            name: Joi.string().required(),
            mobileNo: Joi.string().optional(),
            message: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, name, mobileNo, message } = validatedBody;
            let adminRes = await findUser({ userType: userType.ADMIN })
            await commonFunction.contactUsendEmail(adminRes.email, email, mobileNo, name, message)
            let result = await createContactUs(validatedBody)
            return res.json(new response(result, responseMessage.CONTACT_US));
        } catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /static/addVideo:
     *   post:
     *     tags:
     *       - Video Management
     *     description: addVideo
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: Admin token
     *         in: header
     *         required: true
     *       - name: title
     *         description: title
     *         in: formData
     *         required: true
     *       - name: link
     *         description: link
     *         in: formData
     *         required: true
     *       - name: description
     *         description: description
     *         in: formData
     *         required: true
     *       - name: isaddVideo
     *         description: isaddVideo
     *         in: formData
     *         required: true
     *       - name: bannerImage
     *         description: bannerImage
     *         in: formData
     *         required: false
     *         type: file
     *       - name: videoUrl
     *         description: videoUrl
     *         in: formData
     *         required: false
     *         type: file
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async addVideo(req, res, next) {
        const validationSchema = {
            link: Joi.string().required(),
            title: Joi.string().required(),
            description: Joi.string().required(),
            isaddVideo: Joi.boolean().required(),
            bannerImage: Joi.string().optional(),
            videoUrl: Joi.string().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let findAdmin = await findUser({ _id: req.userId, userType: { $in: [userType.ADMIN, userType.SUBADMIN] }, status: status.ACTIVE })
            if (!findAdmin) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED)
            }
            else {
                let bannerImage = req.files.filter(function (entry) { return (entry.fieldname === "bannerImage") })
                let videoUrl = req.files.filter(function (entry) { return (entry.fieldname === "videoUrl") })
                if (videoUrl.length != 0) {
                    validatedBody.videoUrl = await commonFunction.getImageUrl(videoUrl);
                }
                if (bannerImage.length != 0) {
                    validatedBody.bannerImage = await commonFunction.getImageUrl(bannerImage);
                }
                var result = await createVideo(validatedBody)
                return res.json(new response(result, responseMessage.VIDEO_ADDED));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/viewVideo:
    *   get:
    *     tags:
    *       - Video Management
    *     description: viewVideo
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: _id
    *         description: _id
    *         in: query
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async viewVideo(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var result = await findVideo({ _id: validatedBody._id })
            if (!result) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/editVideo:
    *   put:
    *     tags:
    *       - Video Management
    *     description: editVideo
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: Admin token
    *         in: header
    *         required: true
    *       - name: videoId
    *         description: videoId
    *         in: formData
    *         required: true
    *       - name: title
    *         description: title
    *         in: formData
    *         required: false
    *       - name: link
    *         description: link
    *         in: formData
    *         required: false
    *       - name: description
    *         description: description
    *         in: formData
    *         required: false
    *       - name: isaddVideo
    *         description: isaddVideo
    *         in: formData
    *         required: false
    *       - name: bannerImage
    *         description: bannerImage
    *         in: formData
    *         required: false
    *         type: file
    *       - name: videoUrl
    *         description: videoUrl
    *         in: formData
    *         required: false
    *         type: file
    *     responses:
    *       200:
    *         description: Returns success message
    */

    async editVideo(req, res, next) {
        const validationSchema = {
            videoId: Joi.string().required(),
            link: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            isaddVideo: Joi.boolean().optional(),
            bannerImage: Joi.string().optional(),
            videoUrl: Joi.string().optional()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let findAdmin = await findUser({ _id: req.userId, userType: { $in: [userType.ADMIN, userType.SUBADMIN] }, status: status.ACTIVE })
            if (!findAdmin) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED)
            }
            else {
                let chechVideoId = await findVideo({ _id: validatedBody.videoId, status: { $ne: status.DELETE } })
                if (!chechVideoId) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
                }
                let bannerImage = req.files.filter(function (entry) { return (entry.fieldname === "bannerImage") })
                let videoUrl = req.files.filter(function (entry) { return (entry.fieldname === "videoUrl") })
                if (videoUrl.length != 0) {
                    validatedBody.videoUrl = await commonFunction.getImageUrl(videoUrl);
                }
                if (bannerImage.length != 0) {
                    validatedBody.bannerImage = await commonFunction.getImageUrl(bannerImage);
                }
                var result = await updateVideo({ _id: validatedBody.videoId }, validatedBody)
                return res.json(new response(result, responseMessage.VIDEO_UPDATE));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/deleteVideo:
    *   delete:
    *     tags:
    *       - Video Management
    *     description: deleteVideo
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token of Admin
    *         in: header
    *         required: true
    *       - name: videoId
    *         description: videoId
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async deleteVideo(req, res, next) {
        const validationSchema = {
            videoId: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            var videoFindRes = await findVideo({ _id: validatedBody.videoId, status: { $ne: status.DELETE } });
            if (!videoFindRes) {
                throw apiError.notFound(responseMessage.NOT_FOUND);
            }
            let deleteRes = await updateVideo({ _id: videoFindRes._id }, { status: status.DELETE });
            return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/videoList:
    *   get:
    *     tags:
    *       - Video Management
    *     description: videoList
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: search
    *         description: search
    *         in: query
    *         required: false
    *       - name: page
    *         description: page
    *         in: query
    *         required: false
    *       - name: limit
    *         description: limit
    *         in: query
    *         required: false
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async videoList(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional(),
        };
        try {
            var validatedBody = await Joi.validate(req.query, validationSchema);
            var result = await videoListPagination(validatedBody)
            if (result.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            else {
                return res.json(new response(result, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);
        }
    }


    /**
     * @swagger
     * /static/addNews:
     *   post:
     *     tags:
     *       - News Management
     *     description: addNews
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: Admin token
     *         in: header
     *         required: true
     *       - name: title
     *         description: title
     *         in: formData
     *         required: true
     *       - name: link
     *         description: link
     *         in: formData
     *         required: true
     *       - name: description
     *         description: description
     *         in: formData
     *         required: true
     *       - name: image
     *         description: image
     *         in: formData
     *         required: false
     *         type: file
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async addNews(req, res, next) {
        const validationSchema = {
            link: Joi.string().required(),
            title: Joi.string().required(),
            description: Joi.string().required(),
            image: Joi.string().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let findAdmin = await findUser({ _id: req.userId, userType: { $in: [userType.ADMIN, userType.SUBADMIN] }, status: status.ACTIVE })
            if (!findAdmin) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED)
            }
            else {
                let image = req.files.filter(function (entry) { return (entry.fieldname === "image") })
                if (image.length != 0) {
                    validatedBody.image = await commonFunction.getImageUrl(image);
                }
                var result = await createNews(validatedBody)
                return res.json(new response(result, responseMessage.NEWS_ADDED));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/viewNews:
    *   get:
    *     tags:
    *       - News Management
    *     description: viewNews
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: _id
    *         description: _id
    *         in: query
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async viewNews(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            var result = await findNews({ _id: validatedBody._id })
            if (!result) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            return res.json(new response(result, responseMessage.DATA_FOUND));
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/newsList:
    *   get:
    *     tags:
    *       - News Management
    *     description: newsList
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: search
    *         description: search
    *         in: query
    *         required: false
    *       - name: page
    *         description: page
    *         in: query
    *         required: false
    *       - name: limit
    *         description: limit
    *         in: query
    *         required: false
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async newsList(req, res, next) {
        const validationSchema = {
            search: Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional(),
        };
        try {
            var validatedBody = await Joi.validate(req.query, validationSchema);
            var result = await newsListPagination(validatedBody)
            if (result.docs.length == 0) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            else {
                return res.json(new response(result, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/editNews:
     *   put:
     *     tags:
     *       - News Management
     *     description: editNews
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: Admin token
     *         in: header
     *         required: true
     *       - name: newsId
     *         description: newsId
     *         in: formData
     *         required: true
     *       - name: title
     *         description: title
     *         in: formData
     *         required: false
     *       - name: link
     *         description: link
     *         in: formData
     *         required: false
     *       - name: description
     *         description: description
     *         in: formData
     *         required: false
     *       - name: image
     *         description: image
     *         in: formData
     *         required: false
     *         type: file
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async editNews(req, res, next) {
        const validationSchema = {
            newsId: Joi.string().required(),
            link: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            image: Joi.string().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let findAdmin = await findUser({ _id: req.userId, userType: { $in: [userType.ADMIN, userType.SUBADMIN] }, status: status.ACTIVE })
            if (!findAdmin) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED)
            }
            else {
                var result = await findNews({ _id: validatedBody.newsId })
                if (!result) {
                    throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
                }
                let image = req.files.filter(function (entry) { return (entry.fieldname === "image") })
                if (image.length != 0) {
                    validatedBody.image = await commonFunction.getImageUrl(image);
                }
                var updateRes = await updateNews({ _id: result._id }, validatedBody)
                return res.json(new response(updateRes, responseMessage.NEWS_UPDATE));
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
    * @swagger
    * /static/deleteNews:
    *   delete:
    *     tags:
    *       - News Management
    *     description: deleteNews
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token of Admin
    *         in: header
    *         required: true
    *       - name: newsId
    *         description: newsId
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
    async deleteNews(req, res, next) {
        const validationSchema = {
            newsId: Joi.string().required()
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            let userResult = await findUser({ _id: req.userId, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } });
            if (!userResult) {
                throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
            }
            var newsFindRes = await findNews({ _id: validatedBody.newsId, status: { $ne: status.DELETE } });
            if (!newsFindRes) {
                throw apiError.notFound(responseMessage.NOT_FOUND);
            }
            let deleteRes = await updateNews({ _id: newsFindRes._id }, { status: status.DELETE });
            return res.json(new response(deleteRes, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /static/newLetter:
     *   post:
     *     tags:
     *       - CONTACT US
     *     description: newLetter
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: email
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async newLetter(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { email } = validatedBody;
            await commonFunction.sendNewLetterForUser(email)
            await commonFunction.sendNewLetterForAdmin(email)
            return res.json(new response([], responseMessage.NEW_LETTER));
        } catch (error) {
            return next(error);
        }
    }

}


export default new staticController()
