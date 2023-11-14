import React, { useState, useEffect } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import Exit from "./exit";


function getRegionText(regionCd) {
  switch (regionCd) {
    case 1:
      return "도내";
    case 2:
      return "도외";
    case 3:
      return "기타";
    default:
      return "";
  }
}

function getCalText(calCd) {
  switch (calCd) {
    case 1:
      return "고산농협";
    case 2:
      return "직접정산";
    case 3:
      return "기타";
    default:
      return "";
  }
}

function getUseText(useYn) {
  switch (useYn) {
    case 1:
      return "Y";
    case 2:
      return "N";
    default:
      return "";
  }
}

function App() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [shipmentPlan, setShipmentPlan] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();


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
    { headerName: "사용여부", field: "useYn" },
  ];

  useEffect(() => {
    console.log("Initial rowData state:", rowData);
  }, []);

  const list = async () => {
    try {
      // 필터링할 조건을 담을 변수
      const filters = {};
  
      // 각 필터링 항목에 대한 검사 및 설정
      if (searchParams.regionCd !== "") {
        filters.regionCd = searchParams.regionCd;
      }
  
      if (searchParams.calCd !== "") {
        filters.calCd = searchParams.calCd;
      }
  
      if (searchParams.useYn !== "") {
        filters.useYn = searchParams.useYn;
      }
  
      // 검색어가 입력된 경우에만 추가
      if (searchParams.custNm) {
        filters.custNm = searchParams.custNm;
      }
  
      const response = await fetch(customerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters), // 수정된 부분
      });

      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }

      const result = await response.json();

      if (result.code === "0" && Array.isArray(result.data)) {
        setRowData(result.data);
      } else {
        console.error("잘못된 데이터 형식입니다. 배열이 예상되었습니다.");
      }
    } catch (error) {
      console.error("데이터를 가져오는 중 오류 발생:", error);
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

  const handleUseYnCheckboxChange = (rowIndex) => {
    const updatedRowData = [...rowData];
    updatedRowData[rowIndex].useYn =
      updatedRowData[rowIndex].useYn === 1 ? 2 : 1;
    setRowData(updatedRowData);
  };

  const handleTableRowClick = async (customerId) => {
    try {
      // 클릭한 데이터의 ID를 기반으로 상세정보를 불러오는 API 호출
      const detailUrl = `${serverUrl}test/api/search/customer/detail`;
      const requestBody = { code: customerId }; // POST 요청의 경우 body에 데이터를 넣어 전달
  
      const response = await fetch(detailUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error("네트워크 응답이 올바르지 않습니다");
      }
  
      const result = await response.json();
  
      console.log("Detail API Response:", result);
  
      if (result.code === "0" && result.data) {
        // 성공적으로 데이터를 불러왔을 때 상세정보 갱신
        setSelectedCustomer(result.data);
      } else {
        console.error("상세정보를 불러오는 데 실패했습니다.");
      }
    } catch (error) {
      console.error("상세정보를 불러오는 중 오류 발생:", error);
    }
  };
  
  const handleExitClick = () => {
    // 아이콘을 클릭하면 경고창을 띄우고 확인 버튼을 누르면 exit 파일로 이동
    if (window.confirm("정말로 종료하시겠습니까?")) {
      navigate('/exit');
    }
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
            style={{ marginLeft: "60px", cursor: "pointer" }}
            onClick={handleExitClick}

          ></i>
        </div>
      </div>
      <div className="second">
        <div
          className="second-1"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            className="dropdown"
            style={{ display: "inline-block", position: "relative" }}
          >
            <i
              className="fa-solid fa-bars"
              style={{ marginRight: "30px", cursor: "pointer" }}
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            ></i>
            {isDropdownOpen && (
              <div
                className="dropdown-content"
                style={{
                  position: "absolute",
                  backgroundColor: "#f1f1f1",
                  minWidth: "160px",
                  boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
                  zIndex: 1,
                }}
              >
                <p style={{ padding: "12px 16px", margin: 0 }}>고객사 관리</p>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: "20px" }}>고객사 관리</div>
          </div>
        </div>
        <div className="second-2">
          <button className="second-button" onClick={handleSearchClick}>
            조회
          </button>
          <button className="second-button">저장</button>
        </div>
      </div>
      <div className="third">
        <div className="third-box1">
          지역
          <select
            className="third-select"
            value={searchParams?.regionCd || ""}
            onChange={(e) =>
              handleSearchParamsChange("regionCd", e.target.value)
            }
          >
            <option value="">전체</option>
            <option value="1">도내</option>
            <option value="2">도외</option>
            <option value="3">기타</option>
          </select>
        </div>
        <div className="third-box2">
          정산방법
          <select
            className="third-select"
            value={searchParams.calCd || ""}
            onChange={(e) => handleSearchParamsChange("calCd", e.target.value)}
          >
            <option value="">전체</option>
            <option value="1">고산농협</option>
            <option value="2">직접정산</option>
            <option value="3">기타</option>
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
            value={searchParams.useYn || ""}
            onChange={(e) => handleSearchParamsChange("useYn", e.target.value)}
          >
            <option value="">전체</option>
            <option value="1">Y</option>
            <option value="2">N</option>
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
              <tbody style={{height:"60vh", border:"1px solid gray"}}>
                {rowData === null ? ( // rowData가 null이면 빈 테이블을 보여줌
                  <tr>
                    <td colSpan={columns.length}>데이터가 없습니다.</td>
                  </tr>
                ) : (
                  // 아니면 데이터를 렌더링
                  rowData.map((dataRow, rowIndex) => {
                    console.log("dataRow:", dataRow); // 여기에 콘솔 추가
                    return (

                      <tr key={rowIndex}
                      onClick={() => handleTableRowClick(dataRow.custCd)}
                      style={{ cursor: "pointer" }}>


                        <td>{rowIndex + 1}</td>
                        <td>{dataRow.custCd}</td>
                        <td>{dataRow.custNm}</td>
                        <td>{getRegionText(parseInt(dataRow.regionCd))}</td>
                        <td>{getCalText(parseInt(dataRow.calCd))}</td>
                        <td>
                          <input
                            type="checkbox"
                            id={`useYnCheckbox_${rowIndex}`}
                            checked={parseInt(dataRow.useYn) === 1}
                            onChange={() => handleUseYnCheckboxChange(rowIndex)}
                          />
                          <label htmlFor={`useYnCheckbox_${rowIndex}`}>
                            {getUseText(parseInt(dataRow.useYn))}
                          </label>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="box2">
          <div className="box2-line">
            <div className="box2-title">고객사 상세정보</div>
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
          {selectedCustomer && (
           <>
           <div className="user">고객사코드: {selectedCustomer.custCd}</div>
           <div className="user">고객사명: {selectedCustomer.custNm}</div>
            <div className="user">지역코드: {selectedCustomer.regionCd}</div>
              <div className="user">정산방법코드: {selectedCustomer.calCd}</div>
              <div className="user">출하여부: {selectedCustomer.shipmentYn}</div>
              <div className="user">전화번호: {selectedCustomer.telNo}</div>
              <div className="user">팩스번호: {selectedCustomer.faxNo}</div>
              <div className="user">우편번호: {selectedCustomer.postNo}</div>
              <div className="user">기본주소: {selectedCustomer.addStd}</div>
              <div className="user">상세주소: {selectedCustomer.addDtl}</div>
              <div className="user">담당자명: {selectedCustomer.manNm}</div>
            <div className="user">담당자연락처: {selectedCustomer.manTelNo}</div>
              <div className="user">계산서수취메일: {selectedCustomer.invoiceMail}</div>
            </>
              )}
            <div className="user" style={{marginTop:"2vh"}}>
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
              <select
                className="user-select"
                value={searchParams.regionCd || ""}
                onChange={(e) =>
                  handleSearchParamsChange("regionCd", e.target.value)
                }
              >
                <option value="">전체</option>
                <option value="1">도내</option>
                <option value="2">도외</option>
                <option value="3">기타</option>
              </select>
            </div>
            <div className="user">
              정산방법
              <select
                className="user-select"
                value={searchParams.calCd || ""}
                onChange={(e) =>
                  handleSearchParamsChange("calCd", e.target.value)
                }
              >
                <option value="">전체</option>
                <option value="1">고산농협</option>
                <option value="2">직접정산</option>
                <option value="3">기타</option>
              </select>
            </div>
            <div className="user">
              출하계획
              <div
                style={{
                  border: "1px solid black",
                  marginRight: "10vw",
                  padding: "7px",
                  width: "300px",
                  backgroundColor: "#ffff",
                  display: "flex",
                  marginRight: "3vw"
                }}
              >
                <div style={{marginLeft:"50px", marginRight: "50px" }}>
                  <input
                    type="checkbox"
                    id="shipmentPlanCheckbox"
                    checked={shipmentPlan}
                    onChange={(e) => setShipmentPlan(e.target.checked)}
                  />
                  <label htmlFor="shipmentPlanCheckbox">사용</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="noShipmentPlanCheckbox"
                    checked={shipmentPlan === false}
                    onChange={(e) => setShipmentPlan(!e.target.checked)}
                  />
                  <label htmlFor="noShipmentPlanCheckbox">미사용</label>
                </div>
              </div>
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
                  right: "16vw",
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