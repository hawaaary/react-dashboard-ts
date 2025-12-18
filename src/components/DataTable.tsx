import { useState, useEffect } from "react";
import API from "../api/http";
import { getRandomLogo } from "../utils/logos";
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

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = `/meta/${source}`;
      console.log("Fetching metadata from:", endpoint);
      const response = await API.get(endpoint);
      console.log("Metadata response:", response);
      if (response.data.status === 200) {
        setMetadata(response.data.data);
      } else {
        const errorMsg = `Failed to fetch metadata: ${response.data.message || "Invalid response status"}`;
        console.error(errorMsg);
        setMetadata(null);
        setError(errorMsg);
      }
    } catch (error: any) {
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
      if (response.data.status === 200) {
        setSelectedRow(response.data.data);
        setShowDetail(true);
      }
    } catch (error) {
      console.error("Failed to fetch row details:", error);
    }
  };

  const handleAction = async (action: string) => {
    try {
      const response = await API.post(`/${action}`);
      if (response.data.status === 200) {
        alert("Action completed successfully");
        fetchData(currentPage);
      }
    } catch (error) {
      console.error("Failed to perform action:", error);
      alert("Action failed");
    }
  };

  if (loading && !metadata) {
    return <div className="datatable-loading">Loading...</div>;
  }

  if (!metadata) {
    return <div className="datatable-error">Failed to load data structure. Please check browser console for details.</div>;
  }

  if (error && !data.length) {
    return <div className="datatable-error">{error}</div>;
  }

  return (
    <div className="datatable-container">
      <div className="datatable-header">
        <h2>{label}</h2>
        <button className="btn-create">+ Add New</button>
      </div>

      <div className="datatable-wrapper">
        <table className="datatable">
          <thead>
            <tr>
              <th className="th-logo">Logo</th>
              {metadata.list.map((col) => (
                <th key={col.source}>{col.label}</th>
              ))}
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} style={row.rowColor ? { backgroundColor: row.rowColor } : {}}>
                <td className="td-logo">
                  <span className="logo-badge">{getRandomLogo()}</span>
                </td>
                {metadata.list.map((col) => (
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
                    <button
                      className="btn-show"
                      onClick={() => handleShowDetail(row)}
                      title="Show Details"
                    >
                      👁️
                    </button>
                    {row.listActions && row.listActions.length > 0 && (
                      <div className="dropdown">
                        <button className="btn-dropdown">⋮</button>
                        <div className="dropdown-content">
                          {row.listActions.map((action, idx) => (
                            <button
                              key={idx}
                              className="dropdown-item"
                              onClick={() => handleAction(action.source)}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="datatable-footer">
          <div className="pagination-info">
            Showing {pagination.from_record} to {pagination.to_record} of {pagination.total_records}
          </div>
          <div className="pagination-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              disabled={currentPage === pagination.last_page}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next →
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
              {metadata.show.map((col) => (
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
