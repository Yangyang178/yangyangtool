var cloud = require('wx-server-sdk')
var nodemailer = require('nodemailer')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

var transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: '1990909398@qq.com',
    pass: 'bswwjjkzztlsbeif'
  }
})

var TO_EMAIL = '1990909398@qq.com'

exports.main = async (event, context) => {
  var feedbackType = event.feedbackType || 'other'
  var feedbackContent = event.feedbackContent || ''
  var contactInfo = event.contactInfo || '未填写'
  var deviceInfo = event.deviceInfo || '未知'

  if (!feedbackContent || !feedbackContent.trim()) {
    return { success: false, error: '反馈内容为空' }
  }

  var now = new Date(Date.now() + 8 * 3600000)
  var m = now.getUTCMonth() + 1
  var d = now.getUTCDate()
  var h = now.getUTCHours()
  var min = now.getUTCMinutes()
  var mStr = m < 10 ? '0' + m : '' + m
  var dStr = d < 10 ? '0' + d : '' + d
  var hStr = h < 10 ? '0' + h : '' + h
  var minStr = min < 10 ? '0' + min : '' + min
  var timeStr = now.getFullYear() + '-' + mStr + '-' + dStr + ' ' + hStr + ':' + minStr

  var typeLabels = {
    bug: '问题反馈',
    suggestion: '功能建议',
    other: '其他',
    tool_request: '工具需求'
  }

  var db = cloud.database()
  var dbResult = null

  try {
    dbResult = await db.collection('user_feedbacks').add({
      data: {
        type: feedbackType,
        typeName: typeLabels[feedbackType] || '其他',
        content: feedbackContent,
        contact: contactInfo,
        device: deviceInfo,
        time: timeStr,
        timestamp: Date.now(),
        status: 'pending',
        _createTime: db.serverDate()
      }
    })
  } catch (e) {
    console.error('保存数据库失败:', e)
  }

  var typeName = typeLabels[feedbackType] || '其他'
  var subject = '[百宝工具箱] ' + typeName + ' - ' + timeStr

  var htmlBody = '<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">'
    + '<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:24px;border-radius:12px 12px 0 0;">'
    + '<h2 style="color:#fff;margin:0;font-size:20px;">📦 百宝工具箱 - ' + typeName + '</h2>'
    + '<p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">提交时间：' + timeStr + '</p>'
    + '</div>'
    + '<div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;">'
    + '<table style="width:100%;border-collapse:collapse;font-size:14px;">'
    + '<tr><td style="padding:10px 0;color:#6b7280;width:80px;">类型</td><td style="padding:10px 0;color:#1f2937;font-weight:600;">' + typeName + '</td></tr>'
    + '<tr><td style="padding:10px 0;color:#6b7280;border-top:1px solid #f3f4f6;">联系方式</td><td style="padding:10px 0;color:#1f2937;border-top:1px solid #f3f4f6;">' + contactInfo + '</td></tr>'
    + '<tr><td style="padding:10px 0;color:#6b7280;border-top:1px solid #f3f4f6;">设备信息</td><td style="padding:10px 0;color:#1f2937;border-top:1px solid #f3f4f6;">' + deviceInfo + '</td></tr>'
    + '</table>'
    + '<div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px;border-left:4px solid #667eea;">'
    + '<p style="margin:0;color:#374151;line-height:1.7;white-space:pre-wrap;">' + feedbackContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>'
    + '</div>'
    + '</div>'
    + '<div style="background:#f9fafb;padding:16px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;text-align:center;">'
    + '<p style="margin:0;color:#9ca3af;font-size:12px;">来自百宝工具箱微信小程序用户反馈</p>'
    + '</div>'
    + '</div>'

  var emailResult = null
  try {
    emailResult = await transporter.sendMail({
      from: '"百宝工具箱" <1990909398@qq.com>',
      to: TO_EMAIL,
      subject: subject,
      html: htmlBody
    })
  } catch (e) {
    console.error('发送邮件失败:', e)
  }

  return {
    success: !!(dbResult || emailResult),
    dbSaved: !!dbResult,
    emailSent: !!emailResult
  }
}
