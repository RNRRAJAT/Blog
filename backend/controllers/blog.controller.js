import { Blog } from "../models/blog.model.js";
import getDataUri from "../utils/dataUri.js"
import cloudinary from "../utils/cloudinary.js"

export const createBlog = async(req,res)=>{
    try {
        const {title,catagory}=req.body;
        if(!title || !catagory){
            return res.status(400).json({
                message:"Blog title and catagory is required"
            })
        }
        const blog = await Blog.create({
            title,
            catagory,
            author:req.id
        })

        return res.status(201).json({
            success:true,
            blog,
            message:"Blog created successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create blog"
        })
    }
}

export const updateBlog = async(req,res)=>{
    try {
        const blogId=req.params.blogId
        const {title, subtitle, description, catagory}=req.body;
        const file=req.file;

        let blog=await Blog.findById(blogId);
        if(!blog){
            return res.status(404).json({
                message:"Blog not found"
            })
        }
        let thumbnail;
        if(file){
            const fileUri=getDataUri(file);
            thumbnail = await cloudinary.uploader.upload(fileUri)
        }
        const updateData = {title, subtitle, description, catagory, author:req.id, thumbnail:thumbnail?.secure_url}
        blog=await Blog.findByIdAndUpdate(blogId,updateData, {new:true})
        return res.status(200).json({
            success:true,
            message:"Blog updated successfully",
            blog
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error Updating Blog"
        })
    }
}

export const getOwnBlogs = async(req,res)=>{
    try {
        const userId=req.id;
        if(!userId){
            return res.status(400).json({
                message:"User id is required"
            })
        }
        const blogs = await Blog.find({author:userId}).populate({
            path:"author",
            select : 'firstName lastName photoUrl'
        })
        if(!blogs){
            return res.status(404).json({
                message:"No blogs found",
                blogs:[],
                success:false
            })
        }
        res.status(200).json({
            blogs,
            success:true
        })
    } catch (error) {
        return res.status(500).json({
            message:"Error fetching blogs",
            error:error.message
        })
    }
}

export const deleteBlog = async(req,res)=>{
    try {
        const blogId= req.params.id;
        const authorId = req.id
        const blog=await Blog.findById(blogId)
        if(!blog){
            return res.status(404).json({
                success:false,
                message:"Blog not found"
            })
        }
        if(blog.author.toString() !== authorId){
            return res.status(403).json({
                success:false,
                message:"Unauthorised to delete this blog"
            })
        }
        await Blog.findByIdAndDelete(blogId)
        res.status(200).json({
            success:true,
            message:"Blog deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({success:false,message:"Error deleting blog", error:error.message})
    }
}

export const getPublishedBlog = async(_,res)=>{
    try {
        const blogs = await Blog.find({isPublished:true}).sort({createdAt:-1}).populate({path:"author", select:"firstName lastName photoUrl"})
        if(!blogs){
            return res.status(401).json({
                message:"Blogs not found",
            })
        }
        return res.status(200).json({
            success:true,
            blogs
        })
    } catch (error) {
        return res.status(500).json({
            message:"Failed to get published blogs"
        })
    }
}

export const togglePublishBlog = async(req,res)=>{
    try {
        const {blogId}=req.params;
        // const {publish}=req.query; //true or false
        const blog = await Blog.findById(blogId)
        if(!blog){
            return res.status(404).json({
                message:"Blog not found"
            })
        }
        //publish status based on the query parameter
        blog.isPublished = !blog.isPublished
        await blog.save()
        
        const statusMessage = blog.isPublished ? "Published" : "Unpublished"
        return res.status(200).json({
            success:true,
            message:`Blog is ${statusMessage}`
        })
    } catch (error) {
        return res.status(500).json({
            message:"Failed to update status"
        })
    }
}

export const likeBlog = async (req,res)=>{
    try {
        const blogId=req.params.id;
        const likeKrneWaleUserKiId = req.id;
        const blog = await Blog.findById(blogId).populate({path:"likes"});
        if(!blog){
            return res.status(404).json({
                message:"Blog not found",
                success: false
            })
        }
        await blog.updateOne({$addToSet : {likes: likeKrneWaleUserKiId}})
        await blog.save()
        return res.status(200).json({
            message:"Blog liked",
            blog,
            success:true
        })
    } catch (error) {
        console.log(error)
    }
}

export const dislikeBlog = async (req,res)=>{
    try {
        const blogId=req.params.id;
        const likeKrneWaleUserKiId = req.id;
        const blog = await Blog.findById(blogId);
        if(!blog){
            return res.status(404).json({
                message:"Blog not found",
                success: false
            })
        }
        //dislike logic
        await blog.updateOne({$pull : {likes: likeKrneWaleUserKiId}})
        await blog.save()
        return res.status(200).json({
            message:"Blog disliked",
            blog,
            success:true
        })
    } catch (error) {
        console.log(error)
    }
}

export const getMyTotalBlogLikes = async(req,res)=>{
    try {
        const userId = req.id;
        const myBlogs = await Blog.find({author:userId}).select("likes")
        const totalLikes = myBlogs.reduce((acc,blog)=>acc+(blog.likes?.length || 0), 0)

        return res.status(200).json({
            success:true,
            totalBlogs: myBlogs.length,
            totalLikes
        })
    } catch (error) {
        return res.status(500).json({
            message:"Failed to fetech total blog likes",
            success:false
        })
    }
}

