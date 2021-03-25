import 'dotenv/config';
import Mail from '../utils/Mail';

export default class EmailSenderService {
  public async execute(email) {
    const sendEmail = await Mail.sendMail({
      from: `<${email.sender}>`,
      to: `${email.recipient}`,
      subject: `${email.subject}`,
      text: `${email.content}`,
    });
    return sendEmail;
  }
}
