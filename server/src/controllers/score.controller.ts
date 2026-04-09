import type { Request, Response, NextFunction} from "express";

export const getTopScores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //code some shit in hereeeee
        const {scores} = req.body;
        let output:number[] = [];
        for(let score of scores){ //look through all scores
            if(output.length<10){
                output.push(score); //add any score if output not yet full
            }else{ //check if score replaces existing score v
                let min:number = Infinity;
                let index:number = 0;
                for(let out in output){ //look through current top scores
                    if(typeof(output[out])=="number" && output[out]<min){ //remember lowest score in output
                        min=output[out];
                        index=out;
                    }
                }
                if(min>score){ //replace lowest output score with new score
                    output.splice(index,1);
                    output.push(score);
                }
            }
        }
        return output;
    } catch(error) {
        next(error);
    }
};

export const saveScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //code some more shit over hereeeee c('.'c)

    } catch(error) {
        next(error);
    }
};