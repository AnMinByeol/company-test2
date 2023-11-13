import "./App.css";
import React, { useState, useEffect } from "react";

function App() {
  const [rowData, setRowData] = useState(null); 
  const [commonCodeData, setCommonCodeData] = useState([]);
  const [searchParams, setSearchParams] = useState({
    custNm: "하나",
    regionCd: null,
    calCd: null,
    useYn: null,
  });

  const serverUrl = "http://133.186.221.46:8090/";
  const commonCodeApiEndpoint = "test/api/commonCode";
  const customerApiEndpoint = "test/api/search/customer";
  const commonCodeUrl = `${serverUrl}${commonCodeApiEndpoint}`;
  const customerUrl = `${serverUrl}${customerApiEndpoint}`;

  const columns = [
    { headerName: "번호", field: "number" },
    { headerName: "고객사코드", field: "custCd" },
    { headerName: "고객사명", field: "custNm" },
    { headerName: "지역", field: "regionCd" },
    { headerName: "정산방법", field: "calCd" },
    { headerName: "사용여부", field: "shipmentYn" },
  ];

  useEffect(() => {
    console.log("Initial rowData state:", rowData);
  }, []);
  
  const list = async () => {
    try {
      const response = await fetch(customerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const result = await response.json();
  
      if (result.code === '0' && Array.isArray(result.data)) {
        setRowData(result.data);
      } else {
        console.error("Invalid data format. Expected an array.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };  
  
  const handleSearchParamsChange = (field, value) => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      [field]: value,
    }));
  };

  const handleSearchClick = () => {
    list();
  };

  return (
    <div className="App">
      <div className="first">
        <div className="first-1">비즈위즈시스템</div>
        <div className="first-2">
          <i className="fa-solid fa-circle-user" style={{ marginRight: "10px" }}></i>
          안민별
          <i className="fa-solid fa-right-from-bracket" style={{ marginLeft: "60px" }}></i>
        </div>
      </div>
      <div className="second">
        <div className="second-1">
          <i className="fa-solid fa-bars" style={{ marginRight: "30px" }}></i>
          고객사 관리
        </div>
        <div className="second-2">
          <button className="second-button" onClick={handleSearchClick}>조회</button>
          <button className="second-button">저장</button>
        </div>
      </div>
      <div className="third">
        <div className="third-box1">
          지역
          <select
            className="third-select"
            onChange={(e) => handleSearchParamsChange("regionCd", e.target.value)}
          >
            <option value="서울">서울</option>
          </select>
        </div>
        <div className="third-box2">
          정산방법
          <select
            className="third-select"
            onChange={(e) => handleSearchParamsChange("calCd", e.target.value)}
          >
            <option value="농협">농협</option>
          </select>
        </div>
        <div className="third-input">
          고객사명
          <input
            type="text"
            placeholder="고객사명 입력"
            style={{ marginLeft: "10px", width: "15vw", height: "30px" }}
            onChange={(e) => handleSearchParamsChange("custNm", e.target.value)}
          />
        </div>
        <div className="third-box3">
          사용여부
          <select
            className="third-select"
            onChange={(e) => handleSearchParamsChange("useYn", e.target.value)}
          >
            <option value="체크박스">전체</option>
          </select>
        </div>
      </div>
      <div className="boxes">
        <div className="box1">
          <div className="box1-title">고객사 목록</div>
          <div>
            <table className="table-container">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.field}>{col.headerName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowData === null ? ( // rowData가 null이면 빈 테이블을 보여줌
                  <tr>
                    <td colSpan={columns.length}>데이터가 없습니다.</td>
                  </tr>
                ) : (
                  // 아니면 데이터를 렌더링
                  rowData.map((dataRow, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((col) => (
                        <td key={col.field}>{dataRow[col.field]}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="box2">
          <div className="box2-line">
            <div className="box2-title">고객사 상세정보</div>
            <div>
              <i className="fa-solid fa-plus" style={{ marginRight: "20px" }}></i>
              <i className="fa-regular fa-floppy-disk"></i>
            </div>
          </div>
          {/*고객사 상세정보 */}
          <div className="user-information">
            <div className="user">
              고객사코드
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
              />
            </div>
            <div className="user">
              고객사명
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
              />
            </div>
            <div className="user">
              지역
              <select className="user-select">
                <option value="체크박스">전체</option>
              </select>
            </div>
            <div className="user">
              정산방법
              <select className="user-select">
                <option value="체크박스">전체</option>
              </select>
            </div>
            <div className="user">
              출하계획
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
              />
            </div>
            <div className="user">
              전화번호
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
              />
            </div>
            <div className="user">
              팩스번호
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
              />
            </div>
            <div className="user">
              우편번호
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
                style={{ position: "relative" }}
              />
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  right: "230px",
                }}
              ></i>
            </div>
            <div className="user">
              기본주소
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
              />
            </div>
            <div className="user">
              상세주소
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
              />
            </div>
            <div className="user">
              담당자
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
              />
            </div>
            <div className="user">
              담당자연락처
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
              />
            </div>
            <div className="user">
              계산서수취메일
              <input
                type="text"
                placeholder="고객사명 입력"
                className="user-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;