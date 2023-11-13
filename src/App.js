import "./App.css";
import React, { useState, useEffect } from "react";

function App() {
  const [tableData, setTableData] = useState([]);

  // 서버 URL과 API 분리
  const serverUrl = "http://133.186.221.46:8090/";
  const commonCodeApiEndpoint = "test/api/commonCode";
  const customerApiEndpoint = "test/api/search/customer";
  const commonCodeUrl = `${serverUrl}${commonCodeApiEndpoint}`;
  const customerUrl = `${serverUrl}${customerApiEndpoint}`;

  // 테이블의 컬럼 정의
  const columns = [
    { headerName: "번호", field: "number" },
    { headerName: "고객사코드", field: "code" },
    { headerName: "고객사명", field: "userName" },
    { headerName: "지역", field: "region" },
    { headerName: "정산방법", field: "money" },
    { headerName: "사용여부", field: "okno" },
  ];

  useEffect(() => {
    list();
  }, [tableData]);

  const list = () => {
    fetch(customerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        custNm: "하나",
        regionCd: null,
        calCd: null,
        useYn: null,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTableData(data); // Assuming the API response is an array of objects
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  return (
    <div className="App">
      <div className="first">
        <div className="first-1">비즈위즈시스템</div>
        <div className="first-2">
          <i
            className="fa-solid fa-circle-user"
            style={{ marginRight: "10px" }}
          ></i>
          안민별
          <i
            className="fa-solid fa-right-from-bracket"
            style={{ marginLeft: "60px" }}
          ></i>
        </div>
      </div>
      <div className="second">
        <div className="second-1">
          <i className="fa-solid fa-bars"></i>
          고객사 관리
        </div>
        <div className="second-2">
          <button className="second-button">조회</button>
          <button className="second-button">저장</button>
        </div>
      </div>
      <div className="third">
        <div className="third-box1">
          지역
          <select className="third-select">
            <option value="서울">서울</option>
          </select>
        </div>
        <div className="third-box2">
          정산방법
          <select className="third-select">
            <option value="농협">농협</option>
          </select>
        </div>
        <div className="third-input">
          고객사명
          <input
            type="text"
            placeholder="고객사명 입력"
            style={{ marginLeft: "10px", width: "15vw", height: "30px" }}
          />
        </div>
        <div className="third-box3">
          사용여부
          <select className="third-select">
            <option value="체크박스">전체</option>
          </select>
        </div>
      </div>
      <div className="boxes">
        <div className="box1">
          <div style={{ marginBottom: "10px", fontWeight: "bolder" }}>
            고객사 목록
          </div>
          <div>
            {/* Add the table-container class to your table */}
            <table className="table-container">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.field}>{col.headerName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((rowData, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col) => (
                      <td key={col.field}>{rowData[col.field]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="box2">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bolder",
            }}
          >
            고객사 상세정보
            <div>
              <i
                className="fa-solid fa-plus"
                style={{ marginRight: "20px" }}
              ></i>
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
