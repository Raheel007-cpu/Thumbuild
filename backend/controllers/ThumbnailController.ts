import { Request, Response } from "express"
import Thumbnail from "../models/Thumbnail.js";
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import ai from "../configs/ai.js";
import path from "path";
import fs from "fs";
import {v2 as cloudinary} from 'cloudinary'


const stylePrompts = {
    'Bold & Graphic' : 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
    'Tech/Futuristic' : 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
    'Minimalist' : 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
    'Photorealistic' : 'photorealistic thumbnail, ultra realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
    'Illustrated' : 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
}

const colorSchemeDescriptions = {
    vibrant: 'bold, high-energy hues with intense saturation and striking contrasts for maximum visual impact',
    sunset: 'warm evening tones blending orange, pink, and purple with smooth gradients and a soft cinematic radiance',
    forest: 'earthy greens and natural shades creating a peaceful, organic feel with a refreshing outdoor vibe',
    neon: 'electric neon lighting in vivid blues and pinks with cyberpunk-inspired glow and strong contrast',
    purple: 'rich purple-focused palette featuring magenta and violet accents for a sleek, contemporary feel',
    monochrome: 'classic black-and-white scheme with sharp contrast, dramatic light, and enduring style',
    ocean: 'cool blues and teals forming a watery palette that feels crisp, clean, and refreshing',
    pastel: 'delicate, muted pastel shades with soft saturation and gentle hues for a relaxed, welcoming look',
}
export const generateThumbnail = async(req: Request, res: Response)=>{
    try{
        const{userId} = req.session;
        const {title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay} = req.body;

        const thumbnail = await Thumbnail.create({
            userId,
            title,
            prompt_used: user_prompt,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true
        })

        const model = 'gemini-3.1-flash-image';
        const generationConfig: GenerateContentConfig = {
            maxOutputTokens: 32768,
            temperature: 1,
            topP: 0.95,
            responseModalities: ['IMAGE'],
            imageConfig: {
                aspectRatio: aspect_ratio ||'16:9',
                imageSize: '1k',
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.OFF},
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.OFF},
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.OFF},
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.OFF},
            ]
        }

        let prompt =  `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;

        if(color_scheme){
            prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`
        }

        if(user_prompt){
            prompt += `Additional details: ${user_prompt}. `
        }

        prompt += `The thumbnail should be ${aspect_ratio}, eye-catching and striking, optimized to drive maximum click-through rate. Keep it bold, polished, and impossible to overlook.`

        // Generate the Image using AI Model
        const response: any = await ai.models.generateContent({
            model,
            contents: [prompt],
            config: generationConfig
        })

        //Check if the response is valid
        if(!response?.candidates?.[0]?.content?.parts){
            throw new Error('Unexpected response')
        }

        const parts = response.candidates[0].content.parts;

        let finalBuffer: Buffer | null = null;

        for(const part of parts){
            if(part.inlineData){
                finalBuffer = Buffer.from(part.inlineData.data, 'base64')
            }
        }

        const filename = `final-output-${Date.now()}.png`;
        const filepath = path.join('images', filename);

        //Create the images directory if it doesn't exist
        fs.mkdirSync('images', {recursive: true})

        // Write the final image to the file
        fs.writeFileSync(filepath, finalBuffer!);

        const uploadResult = await cloudinary.uploader.upload(filepath, {resource_type: 'image'})

        thumbnail.image_url = uploadResult.url;
        thumbnail.isGenerating = false;
        await thumbnail.save()

        res.json({message: 'Thumbnail Generated', thumbnail})

        //remove image file from disk
        fs.unlinkSync(filepath)

    } catch(error: any){
        console.log(error);
        res.status(500).json({message: error.message});
    }
}

//Controllers  for Thumbnail Deletion
export const deleteThumbnail = async(req: Request, res: Response)=>{
    try{
        const {id} = req.params;
        const {userId} = req.session;

        await Thumbnail.findByIdAndDelete({_id: id, userId})

        res.json({message: 'Thumbnail deleted successfully'});
    } catch(error: any){
        console.log(error);
        res.status(500).json({message: error.message});
    }
}