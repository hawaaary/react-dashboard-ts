interface Props {
  type?: "success" | "error";
  message: string;
}

export default function FlashMessage({ type = "error", message }: Props) {
  const styles: any = {
    success: {
      background: "#d4edda",
      color: "#155724",
      borderLeft: "5px solid #28a745",
      padding: "12px 15px",
      borderRadius: "6px",
      marginTop: "15px",
      fontSize: "14px",
      fontWeight: "500",
    },
    error: {
      background: "#f8d7da",
      color: "#721c24",
      borderLeft: "5px solid #dc3545",
      padding: "12px 15px",
      borderRadius: "6px",
      marginTop: "15px",
      fontSize: "14px",
      fontWeight: "500",
    }
  };

  return <div style={styles[type]}>{message}</div>;
}
