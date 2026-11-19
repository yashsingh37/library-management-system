function Message({ children, type = "error" }) {
  if (!children) return null;
  return <div className={`message ${type}`}>{children}</div>;
}
export default Message;
