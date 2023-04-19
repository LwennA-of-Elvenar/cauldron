import { ReactNode } from 'react';

export enum ErrorLevel {
  Error,
  Warning,
}

export type MessageType = {
  message: ReactNode;
  level: ErrorLevel;
};

type MessageListProps = {
  messageList: MessageType[];
};

const Message = ({ message, level }: MessageType) => {
  const errorLevelClasses = {
    [ErrorLevel.Error]: 'error',
    [ErrorLevel.Warning]: 'warning',
  };
  return (
    <div className={errorLevelClasses[level]}>
      {message}{' '}
      <style jsx>{`
        div {
          width: calc(100% - 2px);
          border: 3px solid;
          border-radius: 10px;
          margin: 1px;
          text-align: center;
          padding: 10px;
          box-sizing: border-box;
        }
        div.error {
          border-color: red;
          background-color: lightsalmon;
        }
        div.warning {
          border-color: orange;
          background-color: navajowhite;
        }
      `}</style>
    </div>
  );
};

const MessageBannerContent = ({ messageList }: MessageListProps) => {
  return (
    <div>
      {messageList.map((message, index) => (
        <Message key={index} message={message.message} level={message.level} />
      ))}
      <style jsx>{`
        div {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

const MessageBanner = ({ messageList }: MessageListProps) => {
  const sortedMessageList = messageList.sort((a, b) => {
    const severity = (errorLevel: ErrorLevel) =>
      errorLevel == ErrorLevel.Error ? 1 : 0;
    return severity(a.level) - severity(b.level);
  });

  return (
    <>
      <div className="spacer">
        {<MessageBannerContent messageList={sortedMessageList} />}
      </div>
      <div className="fixed">
        {<MessageBannerContent messageList={sortedMessageList} />}
      </div>
      <style jsx>{`
        div {
          width: 100%;
        }
        div.spacer {
          position: relative;
          visibility: hidden;
        }
        div.fixed {
          position: fixed;
          bottom: 0px;
        }
      `}</style>
    </>
  );
};

export default MessageBanner;
