import { exit } from "process"
import {Builder,By, WebDriver, WebElement,error} from "selenium-webdriver"
import {Options} from "selenium-webdriver/chrome"
import prompts from "prompts"

function erroris<T extends Error>(e:unknown,name:string): e is T {
    return e instanceof Error && e.name == name
    
}
async function sleep(ms:number):Promise<void>{
    return new Promise<void>((resolve)=>{
        setTimeout(()=>{
            resolve()
        },ms)
    })
}
type WebDriverInstance = InstanceType<(typeof WebDriver)>

async function loginTask(findElement: WebDriverInstance["findElement"]){
    const result = await prompts([{
        type: 'text',
        name: 'mailtel',
        message: 'メールアドレス or 電話番号'
      },{
        type: 'password',
        name: 'password',
        message: 'パスワード'
      }]);
    const mailtelInput = await findElement(By.id("input__mailtel"))
    const passwordInput = await findElement(By.id("input__password"))
    const submit = await findElement(By.id("login__submit"))
    await mailtelInput.sendKeys(result.mailtel)
    await passwordInput.sendKeys(result.password)
    await submit.click()
}
async function main() {
    const options = new Options().excludeSwitches("enable-logging")
    const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build()
    try{
        await driver.get("https://live.nicovideo.jp/my?page=0")
        const currentUrl = await driver.getCurrentUrl()
        if(currentUrl.includes("account.nicovideo.jp/login")){
            await loginTask(driver.findElement.bind(driver))
            await driver.get("https://live.nicovideo.jp/my?page=0")
        }
        try{
            while(true){
                const deleteBtn = await driver.findElement(By.css("#liveItemsWrap a.red"))
                await deleteBtn.click()
                console.log("click")
                let alert = await driver.switchTo().alert();
                await alert.accept();
                await sleep(5000)
            }
        }catch(e:unknown){
                if (erroris<error.NoSuchElementError>(e,"NoSuchElementError")){
                    console.log("タイムシフト削除完了")
                }else{
                    throw e
                }
        }
    } finally {
        await driver.quit();
    }
}

main().catch((e)=>{
    console.error(e)
    exit(1)
})
