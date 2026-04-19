class Log{
    #fileName;
    #async;
    #fs = require('fs');

    //uses a default parameter here to make it "optional"
    constructor(fileName, async=false){
        this.#fileName = fileName; 
        this.#async = async;
    }

    write(message){
        if(typeof message !== 'string'){
            console.log('Message is not a string, exiting.');
            return;
        }

        //Get timestamp and append to message
        const updated_message = this.#getDateTime() + message + "\n";

        //write to log file
        if(this.#async){
            this.#write_async(updated_message);
        }else{
            try{
                this.#fs.appendFileSync(this.#fileName, updated_message, 'utf-8'); //here, await will make this synchronous as it not continue until appendFile() returns the Promise 
                console.log("Log entry added");
            }catch (error){
                console.error("An error occurred while appending to " + this.#fileName + ": " + error);
            }
        }
        
        //return this for chaining
        //Note: this is the object that is called, so we return an instance of the object and can method chain
        return this;

    }

    async #write_async(message){
        await this.#fs.appendFile(this.#fileName, message, (err) => {
            if (err){
                console.error("An error occurred while appending async to " + this.#fileName + ": " + err);
            }else{
                console.log("Log entry added asynchronously");
            };
        });
    }

    #getDateTime(){
        const d = new Date();

        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const day = d.getDate().toString().padStart(2, "0");
        const hours = d.getHours().toString().padStart(2, "0");
        const minutes = d.getMinutes().toString().padStart(2, "0");
        const seconds = d.getSeconds().toString().padStart(2, "0");
        
        return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}] `;
    }
}

module.exports = Log;