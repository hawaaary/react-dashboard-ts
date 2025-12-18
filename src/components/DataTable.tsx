import { useState, useEffect } from "react";
import API from "../api/http";
import "./DataTable.css";

interface Column {
  source: string;
  type: string;
  label: string;
}

interface MetaData {
  list: Column[];
  show: Column[];
  create: any[];
  update: any[];
  search: any[];
  filter: any[];
  delete: boolean;
  listActions: any[];
  listExports: any[];
}

interface DataRow {
  id: number;
  [key: string]: any;
  listActions?: Array<{ source: string; action: string; label: string }>;
  rowColor?: string | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  from_record: number;
  to_record: number;
  total_records: number;
  per_page: number;
}

interface DataTableProps {
  source: string;
  label: string;
}

export default function DataTable({ source, label }: DataTableProps) {
  const [metadata, setMetadata] = useState<MetaData | null>(null);
  const [data, setData] = useState<DataRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    fetchMetadata();
  }, [source]);

  useEffect(() => {
    if (metadata) {
      console.log("Metadata loaded, now fetching data for source:", source);
      fetchData(1);
    }
  }, [metadata, source]);

  useEffect(() => {
    if (metadata && currentPage > 1) {
      console.log("Page changed, fetching data for page:", currentPage);
      fetchData(currentPage);
    }
  }, [currentPage]);

  // Close any open dropdown when clicking outside
  useEffect(() => {
    const onDocClick = () => setOpenDropdownId(null);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = `/meta/${source}`;
      console.log("Fetching metadata from:", endpoint);
      const response = await API.get(endpoint);
      console.log("Metadata response:", response);

      // Normalize multiple possible response shapes:
      // 1) { status: 200, data: { list: [...], show: [...] } }
      // 2) { list: [...], show: [...] } (direct)
      // 3) HTTP 200 with payload in response.data
      const payload = response.data;

      let metaObj: any = null;
      if (payload == null) {
        metaObj = null;
      } else if (payload.status === 200 && payload.data) {
        // payload.data might already be the metadata object
        metaObj = payload.data;
      } else if (payload.list && payload.show) {
        // payload is the metadata
        metaObj = payload;
      } else if (response.status === 200 && typeof payload === "object") {
        // Fallback: assume payload is metadata
        metaObj = payload;
      }

      if (metaObj && metaObj.list && metaObj.show) {
        setMetadata(metaObj);
      } else {
        const errorMsg = `Failed to fetch metadata: Invalid response shape`;
        console.error(errorMsg, response);
        setMetadata(null);
        setError(errorMsg);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        const errorMsg = `Unauthorized — please log in`;
        console.error(errorMsg, error);
        setMetadata(null);
        setError(errorMsg);
        return;
      }
      const errorMsg = `Failed to fetch metadata: ${error.message || "Unknown error"}`;
      console.error(errorMsg, error);
      setMetadata(null);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = `/${source}?page=${page}`;
      console.log("Fetching data from:", endpoint);
      const response = await API.get(endpoint);
      console.log("Data response:", response);
      if (response.data.status === 200) {
        setData(response.data.data);
        setPagination(response.data.meta);
      } else {
        const errorMsg = `Failed to fetch data: ${response.data.message || "Invalid response status"}`;
        console.error(errorMsg);
        setData([]);
        setError(errorMsg);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        const errorMsg = `Unauthorized — please log in`;
        console.error(errorMsg, error);
        setData([]);
        setError(errorMsg);
        return;
      }
      const errorMsg = `Failed to fetch data: ${error.message || "Unknown error"}`;
      console.error(errorMsg, error);
      setData([]);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = async (row: DataRow) => {
    try {
      const response = await API.get(`/${source}/${row.id}`);
      // Only show modal when we have actual data
      if (response && response.data && (response.data.status === 200 || response.status === 200)) {
        const payload = response.data.data ?? response.data;
        if (payload) {
          setSelectedRow(payload);
          setShowDetail(true);
        } else {
          setError("No details found");
        }
      } else {
        setError("No details found");
      }
    } catch (error) {
      console.error("Failed to fetch row details:", error);
    }
  };

  const handleAction = async (action: string, row?: DataRow) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Performing action:", action);
      // Build endpoint: if action doesn't already include an id, append the row id when available
      let endpoint = `/${action}`;
      const hasDigits = /\d+/.test(action);
      if (!hasDigits && row?.id) {
        endpoint = endpoint.replace(/\/$/, "") + `/${row.id}`;
      }
      const response = await API.post(endpoint);
      console.log("Action response:", response);

      const payload = response.data;
      if (payload && (payload.status === 200 || response.status === 200)) {
        // If the action returned a fresh list, use it. Otherwise refresh current page.
        if (payload.data && Array.isArray(payload.data)) {
          setData(payload.data);
          if (payload.meta) setPagination(payload.meta);
        } else if (payload.data && Array.isArray(payload.data.data)) {
          setData(payload.data.data);
          if (payload.data.meta) setPagination(payload.data.meta);
        } else {
          // Most actions modify server state; re-fetch current page to reflect changes
          fetchData(currentPage);
        }
      } else {
        const message = payload && (payload.message || payload.msg) ? (payload.message || payload.msg) : "Action failed";
        console.error("Action failed:", payload);
        setError(message);
      }
    } catch (error: any) {
      console.error("Failed to perform action:", error);
      setError(error?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const getPageNumbers = () => {
    const total = pagination?.last_page ?? 1;
    const maxButtons = 9;
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, currentPage - half);
    let end = start + maxButtons - 1;
    if (end > total) {
      end = total;
      start = total - maxButtons + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  return (
    <div className="datatable">
      {loading && !metadata ? (
        <div className="datatable-loading">Loading...</div>
      ) : error ? (
        <div className="datatable-error">{error}</div>
      ) : !metadata ? (
        <div className="datatable-empty">No metadata available</div>
      ) : (
        <div className="datatable-container">
          <div className="datatable-header">
            <h2>{label}</h2>
          </div>
          <table className="datatable-table">
            <thead>
              <tr>
                <th className="th-index">#</th>
                {(metadata?.list || []).map((col) => (
                  <th key={col.source}>{col.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {data.map((row, idx) => (
              <tr key={row.id} style={row.rowColor ? { backgroundColor: row.rowColor } : {}}>
                <td className="td-index">
                  <span className="index-badge">{((pagination?.current_page ?? currentPage) - 1) * (pagination?.per_page ?? data.length ?? 1) + idx + 1}</span>
                </td>
                {(metadata?.list || []).map((col) => (
                  <td key={col.source} className={`td-${col.type}`}>
                    {col.type === "boolean" ? (
                      <span className={`badge-${row[col.source] ? "active" : "inactive"}`}>
                        {row[col.source] ? "Yes" : "No"}
                      </span>
                    ) : (
                      row[col.source] || "-"
                    )}
                  </td>
                ))}
                <td className="td-actions">
                  <div className="actions-group">
                    <div className={`dropdown ${openDropdownId === row.id ? "open" : ""}`}>
                      <button
                        className="btn-dropdown"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === row.id ? null : row.id);
                        }}
                      >
                        ⋮
                      </button>
                      <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(null);
                            handleShowDetail(row);
                          }}
                        >
                          👁️ Show
                        </button>
                        {row.listActions && row.listActions.length > 0 && (
                          <>
                            <div className="dropdown-sep" />
                            {row.listActions.map((action, idx) => (
                              <button
                                key={idx}
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  handleAction(action.source, row);
                                }}
                              >
                                {action.label}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {pagination && (
        <div className="datatable-footer">
          <div className="pagination-info">
            Showing {pagination.from_record} to {pagination.to_record} of {pagination.total_records}
          </div>
          <div className="pagination-controls">
            <button className="page-button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              ←
            </button>
            {getPageNumbers().map((p) => (
              <button
                key={p}
                className={`page-button ${p === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button className="page-button" disabled={currentPage === pagination.last_page} onClick={() => setCurrentPage(currentPage + 1)}>
              →
            </button>
          </div>
        </div>
      )}

      {showDetail && selectedRow && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Details</h3>
              <button className="btn-close" onClick={() => setShowDetail(false)}>✕</button>
            </div>
            <div className="modal-body">
              {(metadata?.show || []).map((col) => (
                <div key={col.source} className="detail-row">
                  <span className="detail-label">{col.label}:</span>
                  <span className="detail-value">
                    {col.type === "boolean" ? (
                      <span className={`badge-${selectedRow[col.source] ? "active" : "inactive"}`}>
                        {selectedRow[col.source] ? "Yes" : "No"}
                      </span>
                    ) : (
                      selectedRow[col.source] || "-"
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
